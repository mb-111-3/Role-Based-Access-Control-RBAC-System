package main

import (
	"rbac-backend/config"
	"rbac-backend/models"
	"rbac-backend/routes"
	"rbac-backend/seed"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	config.ConnectDB()

	// migrate tables
	config.DB.AutoMigrate(&models.User{}, &models.Content{})

	// seed users
	seed.SeedUsers()

	routes.SetupRoutes(r)

	r.Run(":8080")
}
