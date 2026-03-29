package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var Secret = []byte("secret")

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		header := c.GetHeader("Authorization")
		if header == "" {
			c.JSON(401, gin.H{"error": "No token"})
			c.Abort()
			return
		}

		tokenString := strings.Split(header, " ")[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return Secret, nil
		})

		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims := token.Claims.(jwt.MapClaims)

		c.Set("role", claims["role"])
		c.Next()
	}
}

func Authorize(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {

		userRole := c.GetString("role")

		for _, r := range roles {
			if r == userRole {
				c.Next()
				return
			}
		}

		c.JSON(403, gin.H{"error": "Forbidden"})
		c.Abort()
	}
}
