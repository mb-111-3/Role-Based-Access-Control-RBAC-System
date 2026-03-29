package models

type Content struct {
	ID    uint `gorm:"primaryKey"`
	Title string
	Body  string
}
