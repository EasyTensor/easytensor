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
			fmt.Println("end of file")
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
		initAccessTokenList()
		time.Sleep(3000 * time.Millisecond)
	}
}

func main() {
	fmt.Println("Hello, World!")

	// Intitial setup
	authenticate()
	go checkAccessTokens()

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
		fmt.Println("hi im here")
		accessToken := c.GetHeader("accessToken")
		fmt.Printf("access token: %s", accessToken)
		modelID, ok := tokensMap[accessToken]
		if !ok {
			c.JSON(404, gin.H{"error": "model not found"})
		}
		queryBody, _ := c.GetRawData()
		// fmt.Printf("ok really what is in this? %+v \n", string(queryBody))
		fmt.Printf("header %+v \n", c.Request.Header)
		output := query(queryBody, c.Request.Header, modelID)

		c.JSON(200, output)
	})
	r.GET("/refresh_models/", func(c *gin.Context) {
		initAccessTokenList()
		c.JSON(200, tokensMap)
	})
	// TODO: make sure this is only available for admins/in cluster
	r.GET("/get_tokens/", func(c *gin.Context) {
		c.JSON(200, tokensMap)
	})
	r.Run()
}

func initAccessTokenList() {
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
			fmt.Println("Could not decode token list")
			log.Fatal(err)
		}
	}

	var newTokensMap = map[string]string{}
	for _, token := range fetchedTokens {
		newTokensMap[token.ID] = token.Model
	}
	tokensMap = newTokensMap
}

func authenticate() {
	var loginURL = fmt.Sprintf("%s/v1/dj-rest-auth/login/", getBackendURL())

	var AuthBody2 = map[string]string{
		"username": os.Getenv("CONTROLLER_USERNAME"),
		"password": os.Getenv("CONTROLLER_PASSWORD"),
		"email":    os.Getenv("CONTROLLER_EMAIL"),
	}
	var body, _ = json.Marshal(AuthBody2)
	response, _ := http.Post(loginURL, "application/json", bytes.NewBuffer(body))

	var authResult AuthReturn
	defer response.Body.Close()
	dec := json.NewDecoder(response.Body)

	for {
		if err := dec.Decode(&authResult); err == io.EOF {
			break
		} else if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("auth return: %#v\n", authResult)
	}
	setAuthenticationCredentials(authResult.AccessToken, authResult.RefreshToken)
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
