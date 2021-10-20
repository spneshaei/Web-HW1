// TODO: 404, 500,...
// TODO: In case of formatting error in input of requests
// TODO: Test in real environment
// TODO: better variable names
// TODO: Expiry time for Redis set values?
// TODO: Is it really sha256 or "sha1"???
// TODO: Server logging (log files...?) when error?

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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "wrong format",
		})
		return
	}

	var results map[string]interface{}
	json.Unmarshal([]byte(jsonData), &results)
	inputString := fmt.Sprint(results["string"])

	if len(inputString) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "input string is shorter than 8 characters",
		})
		return
	}

	sha256 := findSha256(inputString)
	err := pool.Do(radix.Cmd(nil, "SET", sha256, inputString))
	if err == nil {
		c.JSON(http.StatusOK, gin.H{
			"result": sha256,
		})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
	}
}

func shaGet(c *gin.Context) {
	jsonData, jsonErr := ioutil.ReadAll(c.Request.Body)

	if jsonErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "wrong format",
		})
		return
	}

	var results map[string]interface{}
	json.Unmarshal([]byte(jsonData), &results)
	inputSha256 := results["sha256"]

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
