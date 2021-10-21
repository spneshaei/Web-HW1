package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"

	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mediocregopher/radix/v3"
)

var pool *radix.Pool
var poolErr error

func findSha256(s string) string {
	h := sha1.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}

func shaPost(c *gin.Context) {
	jsonData, jsonErr := ioutil.ReadAll(c.Request.Body)

	if jsonErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "wrong format",
		})
		return
	}

	var results map[string]interface{}
	json.Unmarshal([]byte(jsonData), &results)
	if results == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "wrong format",
		})
		return
	}
	rawString, hasResult := results["string"]
	if !hasResult {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "wrong format",
		})
		return
	}
	inputString := fmt.Sprint(rawString)

	if len(inputString) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "input string is shorter than 8 characters",
		})
		return
	}

	sha256 := findSha256(inputString)
	err := pool.Do(radix.Cmd(nil, "SET", sha256, inputString))
	if err == nil {
		c.JSON(http.StatusCreated, gin.H{
			"result": sha256,
		})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
	}
}

func shaGet(c *gin.Context) {
	arr, hasResult := c.Request.URL.Query()["sha256"]
	if !hasResult || len(arr) != 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "wrong format",
		})
		return
	}
	inputSha256 := arr[0]
	var value string
	err := pool.Do(radix.Cmd(&value, "GET", fmt.Sprint(inputSha256)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"result": value,
		})
	}
}

func main() {
	router := gin.Default()

	pool, poolErr = radix.NewPool("tcp", "host.docker.internal:6379", 10)
	if poolErr != nil {
		fmt.Println("Error - " + poolErr.Error())
	}

	router.POST("/go/sha", shaPost)
	router.GET("/go/sha", shaGet)

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "endpoint not found",
		})
	})

	router.Run(":7070")
}
