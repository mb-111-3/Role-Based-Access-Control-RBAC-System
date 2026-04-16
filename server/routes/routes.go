package routes

import (
	"rbac/handlers"
	"rbac/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Public
	api.POST("/login", handlers.Login)
	api.POST("/register", handlers.Register)

	// Authenticated
	auth := api.Group("/")
	auth.Use(middleware.AuthRequired())
	auth.GET("/me", handlers.Me)

	// Users — Admin only
	auth.GET("/users", middleware.RequireRole("admin"), handlers.GetUsers)
	auth.POST("/users", middleware.RequireRole("admin"), handlers.AdminCreateUser)
	auth.PUT("/users/:id", middleware.RequireRole("admin"), handlers.UpdateUser)
	auth.DELETE("/users/:id", middleware.RequireRole("admin"), handlers.DeleteUser)

	// Content
	auth.GET("/content", middleware.RequireRole("admin", "editor", "viewer"), handlers.GetContent)
	auth.POST("/content", middleware.RequireRole("admin", "editor"), handlers.CreateContent)
	auth.PUT("/content/:id", middleware.RequireRole("admin", "editor"), handlers.UpdateContent)
	auth.DELETE("/content/:id", middleware.RequireRole("admin"), handlers.DeleteContent)
}
