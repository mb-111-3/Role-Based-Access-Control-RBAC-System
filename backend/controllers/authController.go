package controllers

import (
	"rbac-backend/config"
	"rbac-backend/models"
	"rbac-backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *gin.Context) {
	var input models.User
	var user models.User

	c.BindJSON(&input)

	config.DB.Where("username = ?", input.Username).First(&user)

	if user.ID == 0 {
		c.JSON(401, gin.H{"error": "User not found"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(401, gin.H{"error": "Wrong password"})
		return
	}

	token, _ := utils.GenerateToken(user.Username, user.Role)

	c.JSON(200, gin.H{"token": token})
}
