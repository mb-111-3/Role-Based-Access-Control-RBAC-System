package seed

import (
	"rbac-backend/config"
	"rbac-backend/models"

	"golang.org/x/crypto/bcrypt"
)

func SeedUsers() {

	users := []models.User{
		{Username: "admin", Password: "admin123", Role: "admin"},
		{Username: "editor", Password: "editor123", Role: "editor"},
		{Username: "viewer", Password: "viewer123", Role: "viewer"},
	}

	for _, u := range users {

		hash, _ := bcrypt.GenerateFromPassword([]byte(u.Password), 10)

		var existing models.User
		config.DB.Where("username = ?", u.Username).First(&existing)

		if existing.ID == 0 {
			config.DB.Create(&models.User{
				Username: u.Username,
				Password: string(hash),
				Role:     u.Role,
			})
		}
	}
}
