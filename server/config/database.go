package config

import (
	"fmt"
	"log"
	"os"
	"rbac/models"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func dsn() string {

	// fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
	// getEnv("DB_USER", "root"),
	// getEnv("DB_PASSWORD", "1113"),
	// getEnv("DB_HOST", "localhost"),
	// getEnv("DB_PORT", "3306"),
	// getEnv("DB_NAME", "rbac"),
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local",
		getEnv("DB_USER", "rbac_user"),
		getEnv("DB_PASSWORD", "rbac_pass"),
		getEnv("DB_HOST", "db"),
		getEnv("DB_PORT", "3306"),
		getEnv("DB_NAME", "rbac"),
	)
}

func ConnectDB() {
	var err error
	for i := 1; i <= 10; i++ {
		DB, err = gorm.Open(mysql.Open(dsn()), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err == nil {
			log.Println("✓ MySQL connected")
			return
		}
		log.Printf("MySQL not ready (%d/10), retrying in 3s...", i)
		time.Sleep(3 * time.Second)
	}
	log.Fatal("Failed to connect to MySQL:", err)
}

func MigrateDB() {
	// Fix any empty/duplicate emails before running migration
	fixEmptyEmails()

	if err := DB.AutoMigrate(&models.User{}, &models.Content{}); err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("✓ Database migrated")
}

// fixEmptyEmails: runs raw SQL to patch empty emails BEFORE AutoMigrate
// tries to create the unique index — avoids Error 1062
func fixEmptyEmails() {
	// Only fix if the users table and email column already exist
	var tableExists int
	DB.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'").Scan(&tableExists)
	if tableExists == 0 {
		return // fresh install, nothing to fix
	}

	var colExists int
	DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'email'").Scan(&colExists)
	if colExists == 0 {
		return // email column doesn't exist yet, migration will add it
	}

	// Assign unique placeholder emails to any rows with empty/null email
	DB.Exec("UPDATE users SET email = CONCAT('user_', id, '@placeholder.local') WHERE email = '' OR email IS NULL")
	log.Println("  ✓ Empty emails patched")
}

// SeedDB upserts the three default accounts — always refreshes passwords
// so login works even if the DB had corrupted hashes from old runs.
func SeedDB() {
	type seed struct{ Username, Email, Password, Role string }
	seeds := []seed{
		{"admin", "admin@rbac.dev", "admin123", "admin"},
		{"editor", "editor@rbac.dev", "editor123", "editor"},
		{"viewer", "viewer@rbac.dev", "viewer123", "viewer"},
	}

	for _, s := range seeds {
		hash, err := bcrypt.GenerateFromPassword([]byte(s.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("bcrypt failed for %s: %v", s.Username, err)
		}

		var u models.User
		result := DB.Where("username = ?", s.Username).First(&u)

		if result.Error != nil {
			// User doesn't exist — create fresh
			DB.Create(&models.User{
				Username: s.Username,
				Email:    s.Email,
				Password: string(hash),
				Role:     s.Role,
			})
			log.Printf("  ✓ Created seed user: %s (%s)", s.Username, s.Role)
		} else {
			// User exists — ALWAYS update password + email + role to ensure clean state
			DB.Model(&u).Updates(map[string]interface{}{
				"password": string(hash),
				"email":    s.Email,
				"role":     s.Role,
			})
			log.Printf("  ✓ Refreshed seed user: %s (%s)", s.Username, s.Role)
		}
	}

	// Seed sample content if empty
	var count int64
	DB.Model(&models.Content{}).Count(&count)
	if count == 0 {
		contents := []models.Content{
			{Title: "Getting Started Guide", Body: "Welcome to the RBAC system! This guide explains role-based access control.", CreatedBy: "admin"},
			{Title: "Editor Handbook", Body: "As an editor you can create and update content, but cannot delete or manage users.", CreatedBy: "admin"},
			{Title: "Security Best Practices", Body: "Use strong passwords and never share credentials. JWT tokens expire after 24 hours.", CreatedBy: "editor"},
			{Title: "Public Notice", Body: "All roles can view this content. Viewers have read-only access throughout the system.", CreatedBy: "editor"},
		}
		for _, c := range contents {
			DB.Create(&c)
		}
	}

	log.Println("✓ Database seeded — login with admin/admin123, editor/editor123, viewer/viewer123")
}
