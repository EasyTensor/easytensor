package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// var models = map[string]Model{}

// type Model struct {
// 	Name    string
// 	Id      string
// 	Address string
// }

var accessToken string
var refreshToken string

type AuthReturn struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// var authCache = map[string][]string{}
var consecutiveFailure int64 = 0
var isInitialized bool = false
var namespace string
var client *kubernetes.Clientset

type Output struct {
	Predictions []float64
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

func initK8sCLient() {
	namespace = os.Getenv("NAMESPACE")
	config, err := rest.InClusterConfig()

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	client = clientset
}

func getDeployments(ModelID string) *appsv1.DeploymentList {
	dalist, err := client.AppsV1().Deployments(namespace).List(context.TODO(), metav1.ListOptions{LabelSelector: fmt.Sprintf("type=model-server,model-id=%s", ModelID)})
	fmt.Println(fmt.Sprintf("type=model-server,model-id=%s", ModelID))
	if err != nil {
		panic(err)
	}
	return dalist
}

func main() {
	// Intitial setup, block before strating
	authenticate()
	initK8sCLient()
	isInitialized = true
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
	r.GET("/model-status/:model_id", func(c *gin.Context) {
		ModelID := c.Param("model_id")
		JWT := c.GetHeader("Authorization")
		fmt.Printf("JWT: %s\n", JWT)
		if !userHasAccess(JWT, ModelID) {
			c.JSON(405, gin.H{
				"message": "Unauthorized Access",
			})
		}
		status := "Not Found"
		msg := "No such model is running."
		for _, deployment := range getDeployments(ModelID).Items {
			conditions := deployment.Status.Conditions
			lastCondition := conditions[(len(conditions) - 1)]
			if lastCondition.Type == appsv1.DeploymentAvailable {
				status = "Ready"
				msg = lastCondition.Reason
			} else if lastCondition.Type == appsv1.DeploymentProgressing {
				status = "Not Ready"
				msg = lastCondition.Reason
			} else if lastCondition.Type == appsv1.DeploymentReplicaFailure {
				status = "Failed"
				msg = lastCondition.Reason
			}
			// strconv.
			fmt.Println(status)
		}
		fmt.Println("returning")
		fmt.Println(status)
		c.JSON(200, gin.H{"status": status, "message": msg})
	})
	r.GET("/health_check/liveness/", func(c *gin.Context) {
		if consecutiveFailure > 5 {
			c.JSON(503, gin.H{"cause": fmt.Sprintf("%d consecutive fetch failures", consecutiveFailure)})
		} else {
			c.JSON(200, gin.H{"status": "ok", "consecutive failures": consecutiveFailure})
		}
	})
	r.GET("/health_check/readiness/", func(c *gin.Context) {
		if !isInitialized {
			c.JSON(503, gin.H{"cause": "Appication not yet initialized"})
		} else if consecutiveFailure > 5 {
			c.JSON(503, gin.H{"cause": fmt.Sprintf("%d consecutive fetch failures", consecutiveFailure)})
		} else {
			c.JSON(200, gin.H{"status": "ok", "consecutive failures": consecutiveFailure})
		}
	})
	r.Run()
}

func userHasAccess(userID, modelID string) bool {
	fmt.Println(userID, modelID)
	return true
}

func authenticate() {
	var loginURL = fmt.Sprintf("%s/v1/dj-rest-auth/login/", getBackendURL())

	var AuthBody = map[string]string{
		"username": os.Getenv("CONTROLLER_USERNAME"),
		"password": os.Getenv("CONTROLLER_PASSWORD"),
		"email":    os.Getenv("CONTROLLER_EMAIL"),
	}
	var body, _ = json.Marshal(AuthBody)
	fmt.Println(body)
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
