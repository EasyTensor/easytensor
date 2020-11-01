package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"rsc.io/quote"
)

var models = map[string]Model{}

type Model struct {
	Name    string
	Id      string
	Address string
}

type Output struct {
	Predictions []float64
}

func query(body []byte, headers http.Header, modelID string) interface{} {
	_, ok := models[modelID]
	if !ok {
		fmt.Printf("this model doesn't exist %s\n", modelID)
		return nil
	}
	url := fmt.Sprintf("http://model-serve-tf-%s:8501/v1/models/model:predict", modelID)
	// body := map[string][]float64{
	// 	"instances": []float64{1.0, 2.0, 5.0},
	// }
	// req_body, err := json.Marshal(body)
	// if err != nil {
	// 	log.Fatal(err)
	// 	return nil
	// }
	final := bytes.NewBuffer(body)
	// fmt.Printf("data stream: %+v\n", string(body))
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
		// fmt.Printf("%s: (%s, %s)\n", model.name, model.id, model.address)
		// models = append(models, model)
		// fmt.Printf(" what do we have in hereeeeer? %#v\n", output)
	}
	// fmt.Printf(" what do we have in hereeeeer2? %+v\n", output)
	// for k, v := range output {
	// 	fmt.Printf("%s: %s\n", k, v)
	// }
	return &output
}

func main() {
	fmt.Println("Hello, World!")
	initModelList()
	fmt.Println(quote.Go())
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.POST("/query/", func(c *gin.Context) {
		fmt.Println("hi im here")
		// modelID := c.PostForm("modelID")
		model_query, _ := c.GetRawData()
		// fmt.Printf("ok really what is in this? %+v \n", string(model_query))
		fmt.Printf("header %+v \n", c.Request.Header)
		output := query(model_query, c.Request.Header, "f72045f9-8583-478a-b3f3-d57f71516859")

		c.JSON(200, output)
	})
	r.GET("/refresh_models/", func(c *gin.Context) {
		fmt.Println("hi im here")
		initModelList()
		c.JSON(200, models)
	})
	r.Run()
}

func initModelList() {
	response, _ := http.Get("http://backend-service:8000/models/")
	// if err != nil {
	// 	return []Model{}
	// }
	var fetched_models []Model
	// defer response.Body.Close()
	dec := json.NewDecoder(response.Body)

	// body, err := ioutil.ReadAll(response.Body)
	for {
		// var model Model
		if err := dec.Decode(&fetched_models); err == io.EOF {
			break
		} else if err != nil {
			log.Fatal(err)
		}
		// fmt.Printf("%s: (%s, %s)\n", model.name, model.id, model.address)
		// models = append(models, model)
		fmt.Printf("%#v\n", fetched_models)
	}
	for _, model := range fetched_models {
		models[model.Id] = model
	}
	fmt.Printf("models are now: %#v\n", models)
}
