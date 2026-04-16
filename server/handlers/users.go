package handlers

import (
	"net/http"
	"rbac/config"
	"rbac/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

func GetUsers(c *gin.Context) {
	var users []models.User
	config.DB.Find(&users)
	result := make([]UserResponse, 0, len(users))
	for _, u := range users {
		result = append(result, UserResponse{u.ID, u.Username, u.Email, u.Role})
	}
	c.JSON(http.StatusOK, result)
}

type AdminCreateUserInput struct {
	Username string `json:"username" binding:"required,min=3"`
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role"     binding:"required,oneof=admin editor viewer"`
}

func AdminCreateUser(c *gin.Context) {
	var input AdminCreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}
	user := models.User{Username: input.Username, Email: input.Email, Password: string(hash), Role: input.Role}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}
	c.JSON(http.StatusCreated, UserResponse{user.ID, user.Username, user.Email, user.Role})
}

type UpdateUserInput struct {
	Role string `json:"role" binding:"required,oneof=admin editor viewer"`
}

func UpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	callerID, _ := c.Get("userID")
	if uint(id) == callerID.(uint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change your own role"})
		return
	}
	var input UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	config.DB.Model(&user).Update("role", input.Role)
	c.JSON(http.StatusOK, UserResponse{user.ID, user.Username, user.Email, user.Role})
}

func DeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	callerID, _ := c.Get("userID")
	if uint(id) == callerID.(uint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete your own account"})
		return
	}
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
