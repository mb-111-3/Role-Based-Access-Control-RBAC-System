package handlers

import (
	"net/http"
	"rbac/config"
	"rbac/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetContent(c *gin.Context) {
	var items []models.Content
	config.DB.Order("created_at desc").Find(&items)
	c.JSON(http.StatusOK, items)
}

type ContentInput struct {
	Title string `json:"title" binding:"required,min=3,max=255"`
	Body  string `json:"body"  binding:"required,min=5"`
}

func CreateContent(c *gin.Context) {
	var input ContentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	username, _ := c.Get("username")
	item := models.Content{Title: input.Title, Body: input.Body, CreatedBy: username.(string)}
	config.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateContent(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var item models.Content
	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}
	var input ContentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&item).Updates(map[string]interface{}{"title": input.Title, "body": input.Body})
	c.JSON(http.StatusOK, item)
}

func DeleteContent(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := config.DB.Delete(&models.Content{}, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Content deleted successfully"})
}
