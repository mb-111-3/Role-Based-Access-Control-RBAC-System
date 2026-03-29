# 🔐 RBAC System (React + Golang)

A full-stack Role-Based Access Control (RBAC) system built with **Golang (Gin + GORM + JWT)** and **React (Tailwind + Context API)**.

---

## 🚀 Features

* 🔑 JWT Authentication
* 🛡️ Role-Based Access Control (Admin, Editor, Viewer)
* 🔐 Protected Routes (Frontend + Backend)
* 📄 Content Management (Create, View, Delete)
* 👤 Admin Panel (User Management)
* 🎨 Responsive UI using Tailwind CSS

---

## 🛠️ Tech Stack

### Backend

* Golang (Gin Framework)
* GORM (ORM)
* MySQL
* JWT Authentication
* Bcrypt Password Hashing

### Frontend

* React
* Tailwind CSS
* React Router DOM
* Context API
* Axios

---

## 📁 Project Structure

```
rbac-system/
├── backend/
│   ├── main.go
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   └── utils/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup Instructions

---

### 📌 1. Database Setup

1. Install MySQL
2. Create database:

```sql
CREATE DATABASE rbac_db;
```

3. Open backend config file:

```
backend/config/db.go
```

4. Update your DB credentials:

```go
dsn := "root:password@tcp(127.0.0.1:3306)/rbac_db?charset=utf8mb4&parseTime=True&loc=Local"
```

---

### 📌 2. Run Backend

```bash
cd backend
go mod tidy
go run main.go
```

Backend will start at:

```
http://localhost:8080
```

---

### 📌 3. Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend will start at:

```
http://localhost:3000
```

---

## 🔑 Test Accounts (Pre-Seeded)

| Role   | Username | Password  |
| ------ | -------- | --------- |
| Admin  | admin    | admin123  |
| Editor | editor   | editor123 |
| Viewer | viewer   | viewer123 |

---

## 🔐 Role Permissions

### 👑 Admin

* Manage users
* Create content
* View content
* Delete content

### ✏️ Editor

* Create content
* View content

### 👁️ Viewer

* View content only

---

## 🌐 API Base URL

```
http://localhost:8080/api
```

---

## 📘 API Documentation

---

### 🔑 Authentication

#### Login

```
POST /api/login
```

**Request Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**

```json
{
  "token": "JWT_TOKEN"
}
```

---

### 👤 Users (Admin Only)

#### Get All Users

```
GET /api/users
```

**Headers:**

```
Authorization: Bearer TOKEN
```

---

### 📄 Content APIs

---

#### Create Content (Admin, Editor)

```
POST /api/content
```

**Headers:**

```
Authorization: Bearer TOKEN
```

**Request Body:**

```json
{
  "title": "Sample Content"
}
```

---

#### Get Content (All Roles)

```
GET /api/content
```

---

#### Delete Content (Admin Only)

```
DELETE /api/content/:id
```

---

## 🔗 Frontend-Backend Integration

* Login API returns JWT token
* Token stored in `localStorage`
* Axios attaches token automatically in headers
* Backend validates JWT
* Middleware enforces role-based access
* UI renders based on role

---

## ⚠️ Common Issues & Fixes

### ❌ CORS Error

Add this in `main.go`:

```go
import "github.com/gin-contrib/cors"

r.Use(cors.Default())
```

---

### ❌ Unauthorized (401)

* Ensure token is sent:

```
Authorization: Bearer TOKEN
```

---

### ❌ DB Connection Failed

* Check MySQL is running
* Verify username/password in `db.go`

---
---

## 👨‍💻 Author

Mayur Borse

---
