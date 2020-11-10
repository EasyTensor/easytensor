package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// var models = map[string]Model{}

// type Model struct {
// 	Name    string
// 	Id      string
// 	Address string
// }

var accessToken string
var refreshToken string

type QueryAccessToken struct {
	ID    string
	Model string
}

type AuthReturn struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

var tokensMap = map[string]string{}
var consecutiveFailure int64 = 0
var isInitialized bool = false

type Output struct {
	Predictions []float64
}

func getModelAddressFromModelID(modelID string) string {
	return fmt.Sprintf("http://model-serve-tf-%s:8501/v1/models/model:predict", modelID)
}

func query(body []byte, headers http.Header, modelID string) interface{} {
	url := getModelAddressFromModelID(modelID)
	final := bytes.NewBuffer(body)
	client := &http.Client{}

	req, err := http.NewRequest("POST", url, final)
	for key, value := range headers {
		req.Header.Add(key, value[0])
	}
	resp, err := client.Do(req)
	// ...
	// resp, err := http.Post(url, "application/json", final)
	if err != nil {
		fmt.Println("error with quering the model")
		log.Fatal(err)
		return nil
	}
	dec := json.NewDecoder(resp.Body)
	var output map[string]interface{}
	for {
		// var model Model
		if err := dec.Decode(&output); err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("fatal error")
			log.Fatal(err)
		}
	}

	return &output
}

func checkAccessTokens() {
	for {
		refreshModelTokens()
		if consecutiveFailure > 5 {
			fmt.Println("5 consecutive failures contacting the backend service. Service is unhealthy.")
		}
		time.Sleep(3000 * time.Millisecond)
	}
}

func keepAuthAlive() {
	for {
		authenticate()
		if consecutiveFailure > 5 {
			fmt.Println("5 consecutive failures contacting the backend service. Service is unhealthy.")
		}
		time.Sleep(1 * time.Hour)
	}
}

func main() {
	fmt.Println("Hello, World!")

	// Intitial setup, block before strating
	authenticate()
	refreshModelTokens()
	isInitialized = true

	go checkAccessTokens()
	go keepAuthAlive()

	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AddAllowHeaders("accessToken")
	r.Use(cors.New(config))
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.POST("/query/", func(c *gin.Context) {
		accessToken := c.GetHeader("accessToken")
		modelID, ok := tokensMap[accessToken]
		if !ok {
			c.JSON(404, gin.H{"error": "model not found"})
		}
		queryBody, _ := c.GetRawData()
		// fmt.Printf("header %+v \n", c.Request.Header)
		output := query(queryBody, c.Request.Header, modelID)

		c.JSON(200, output)
	})
	r.GET("/refresh_models/", func(c *gin.Context) {
		refreshModelTokens()
		c.JSON(200, tokensMap)
	})
	// TODO: make sure this is only available for admins/in cluster
	r.GET("/get_tokens/", func(c *gin.Context) {
		c.JSON(200, tokensMap)
	})
	r.GET("/health_check/liveness/", func(c *gin.Context) {
		if consecutiveFailure > 5 {
			c.JSON(503, gin.H{"cause": fmt.Sprintf("%d consecutive fetch failures", consecutiveFailure)})
		} else {
			c.JSON(200, gin.H{})
		}
	})
	r.GET("/health_check/readiness/", func(c *gin.Context) {
		if !isInitialized {
			c.JSON(503, gin.H{"cause": "Appication not yet initialized"})
		} else if consecutiveFailure > 5 {
			c.JSON(503, gin.H{"cause": fmt.Sprintf("%d consecutive fetch failures", consecutiveFailure)})
		} else {
			c.JSON(200, gin.H{})
		}
	})
	r.Run()
}

func refreshModelTokens() {
	var accessTokensURL = fmt.Sprintf("%s/v1/query-access-token/", getBackendURL())
	client := &http.Client{}

	req, _ := http.NewRequest("GET", accessTokensURL, nil)
	var bearer = "Bearer " + accessToken
	req.Header.Add("Authorization", bearer)
	response, _ := client.Do(req)

	var fetchedTokens []QueryAccessToken
	defer response.Body.Close()
	dec := json.NewDecoder(response.Body)

	for {
		// var model Model
		if err := dec.Decode(&fetchedTokens); err == io.EOF {
			break
		} else if err != nil {
			fmt.Println("Could not decode token list, skipping update of token map.", err)
			consecutiveFailure++
			return
		}
	}

	var newTokensMap = map[string]string{}
	for _, token := range fetchedTokens {
		newTokensMap[token.ID] = token.Model
	}
	tokensMap = newTokensMap
	consecutiveFailure = 0
}

func authenticate() {
	var loginURL = fmt.Sprintf("%s/v1/dj-rest-auth/login/", getBackendURL())

	var AuthBody2 = map[string]string{
		"username": os.Getenv("CONTROLLER_USERNAME"),
		"password": os.Getenv("CONTROLLER_PASSWORD"),
		"email":    os.Getenv("CONTROLLER_EMAIL"),
	}
	var body, _ = json.Marshal(AuthBody2)
	// keep trying until we successfully authenticate
	for {
		response, err := http.Post(loginURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			consecutiveFailure++
			fmt.Println(err)
			fmt.Println("Could not authenticate. Trying in 1 second ...")
			time.Sleep(1000 * time.Millisecond)
			continue
		}

		var authResult AuthReturn
		defer response.Body.Close()
		dec := json.NewDecoder(response.Body)

		for {
			if err := dec.Decode(&authResult); err == io.EOF {
				break
			} else if err != nil {
				consecutiveFailure++
				fmt.Println(err)
				fmt.Println("Could not authenticate. Trying in 1 second ...")
				time.Sleep(1000 * time.Millisecond)
				continue
			}
		}
		setAuthenticationCredentials(authResult.AccessToken, authResult.RefreshToken)
		consecutiveFailure = 0
		break
	}
}

func setAuthenticationCredentials(newAccessToken, newRefreshToken string) {
	accessToken = newAccessToken
	refreshToken = newRefreshToken
}

func getBackendURL() string {
	var backendServiceAddress = os.Getenv("BACKEND_SERVER_ADDRESS")
	var backendServicePort = os.Getenv("BACKEND_SERVER_PORT")
	return fmt.Sprintf("http://%s:%s", backendServiceAddress, backendServicePort)
}
