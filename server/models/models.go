package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;not null;size:100" json:"username"`
	Email    string `gorm:"uniqueIndex;not null;size:255" json:"email"`
	Password string `gorm:"not null"                      json:"-"`
	Role     string `gorm:"not null;default:'viewer'"     json:"role"`
}

type Content struct {
	gorm.Model
	Title     string `gorm:"not null;size:255" json:"title"`
	Body      string `gorm:"type:text;not null" json:"body"`
	CreatedBy string `gorm:"not null;size:100"  json:"created_by"`
}
