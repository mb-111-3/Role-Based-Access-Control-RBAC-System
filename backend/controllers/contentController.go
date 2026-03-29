package controllers

import (
	"rbac-backend/config"
	"rbac-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateContent(c *gin.Context) {
	var content models.Content
	c.BindJSON(&content)

	config.DB.Create(&content)
	c.JSON(200, content)
}

func GetContent(c *gin.Context) {
	var contents []models.Content
	config.DB.Find(&contents)

	c.JSON(200, contents)
}

func DeleteContent(c *gin.Context) {
	id := c.Param("id")

	config.DB.Delete(&models.Content{}, id)

	c.JSON(200, gin.H{"message": "Deleted"})
}
