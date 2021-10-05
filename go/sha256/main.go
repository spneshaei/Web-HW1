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
	"fmt"

	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
)

var rdb = redis.NewClient(&redis.Options{
	Addr:     "0.0.0.0:6379",
	Password: "",
	DB:       0,
})

func findSha256(s string) string {
	h := sha1.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}

func shaPost(c *gin.Context) {
	inputString := c.Param("string")
	sha256 := findSha256(inputString)
	fmt.Println("ss", inputString, sha256)
	err := rdb.Set(sha256, string(inputString), 0).Err()
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
	inputSha256 := c.Param("sha256")
	value, err := rdb.Get(inputSha256).Result()
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "value not found",
		})
	} else if err != nil {
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

	router.POST("/sha", shaPost)
	router.GET("/sha", shaGet)

	router.Run(":7070")
}
