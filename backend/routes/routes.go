package routes

import (
	"rbac-backend/controllers"
	"rbac-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	api := r.Group("/api")

	api.POST("/login", controllers.Login)

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())

	protected.GET("/users",
		middleware.Authorize("admin"),
		controllers.GetUsers,
	)

	protected.POST("/content",
		middleware.Authorize("admin", "editor"),
		controllers.CreateContent,
	)

	protected.GET("/content", controllers.GetContent)

	protected.DELETE("/content/:id",
		middleware.Authorize("admin"),
		controllers.DeleteContent,
	)
}
