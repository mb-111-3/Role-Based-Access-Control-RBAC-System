package utils

import (
	"github.com/golang-jwt/jwt/v5"
)

var Secret = []byte("secret")

func GenerateToken(username string, role string) (string, error) {
	claims := jwt.MapClaims{
		"username": username,
		"role":     role,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(Secret)
}
