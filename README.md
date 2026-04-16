# RBAC System (React + Golang + MySQL + Docker)

## Overview
This project is a full-stack Role-Based Access Control (RBAC) system built using:
- Golang (Gin + GORM)
- React (Vite + Tailwind CSS)
- MySQL
- Docker & Docker Compose

The system manages users and content with role-based permissions.

---

## Features

### Backend (Golang)
- JWT Authentication
- Role-Based Access Control (Admin, Editor, Viewer)
- REST APIs
- Middleware for authorization
- MySQL with GORM
- Seeded database

### Frontend (React)
- Login system
- Protected routes
- Role-based UI
- Dashboard & Admin Panel
- Tailwind CSS UI

---

## Roles & Permissions

| Role   | Permissions |
|--------|------------|
| Admin  | Full CRUD on users & content |
| Editor | Create & update content |
| Viewer | Read-only access |

---

## Project Structure

client/
├── index.html               ← root of client folder
├── package.json             ← root of client folder
├── vite.config.js           ← root of client folder
├── tailwind.config.js       ← root of client folder
├── postcss.config.js        ← root of client folder
└── src/
    ├── main.jsx             ← src/
    ├── App.jsx              ← src/
    ├── index.css            ← src/
    ├── api/
    │   └── axios.js         ← src/api/
    ├── context/
    │   └── AuthContext.jsx  ← src/context/
    ├── components/
    │   └── Layout.jsx       ← src/components/
    └── pages/
        ├── Login.jsx        ← src/pages/
        ├── Register.jsx     ← src/pages/
        ├── Dashboard.jsx    ← src/pages/
        ├── ContentPage.jsx  ← src/pages/
        └── AdminPanel.jsx   ← src/pages/


server/
├── main.go                   ← Entry point — starts Gin, CORS, routes
├── go.mod                    ← Go dependencies (run: go mod tidy)
├── Dockerfile                ← For Docker build
│
├── config/
│   └── database.go           ← MySQL connect + AutoMigrate + seed users
│
├── models/
│   └── models.go             ← User & Content GORM structs
│
├── middleware/
│   ├── auth.go               ← JWT validation + RequireRole() guard
│   └── auth_test.go          ← 7 unit tests for middleware
│
├── handlers/
│   ├── auth.go               ← POST /login, POST /register, GET /me
│   ├── users.go              ← GET/POST/PUT/DELETE /users (admin only)
│   └── content.go            ← GET/POST/PUT/DELETE /content
│
└── routes/
    └── routes.go             ← Wires all routes + middleware to handlers

docker-compose.yml
---

## Database Setup (MySQL)

Database Name: `rbac`

### Seed Users

| Role   | Username | Password   |
|--------|----------|-----------|
| Admin  | admin    | admin123  |
| Editor | editor   | editor123 |
| Viewer | viewer   | viewer123 |

---

## Frontend Setup (Without Docker)

```bash
cd client
npm install
npm run dev

## Backend Setup (Without Docker)

```bash
cd server
go mod tidy
go run main.go


## Docker Setup (Recommended)
1. Start Docker
Make sure Docker Desktop is running.

2. Run Project
```bash
docker-compose up --build

3. Stop Project
```bash
docker-compose down

4. Reset Everything (if error)
```bash
docker-compose down -v
docker-compose up --build

---
Docker Configuration
docker-compose.yml
```bash
services:
  mysql:
    image: mysql:8
    container_name: rbac-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123 // Replace with your MySQL Password
      MYSQL_DATABASE: rbac
      MYSQL_USER: rbac_user
      MYSQL_PASSWORD: rbac_pass
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  server:
    build: ./server
    container_name: rbac-server
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      DB_USER: rbac_user
      DB_PASSWORD: rbac_pass
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: rbac

  client:
    build: ./client
    container_name: rbac-client
    ports:
      - "5173:5173"
    depends_on:
      - server

volumes:
  mysql_data:

---

## Access URLs
```bash
| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend  | [http://localhost:8080](http://localhost:8080) |
| MySQL    | localhost:3307                                 |


## Database Access Using Docker CLI
```bash
docker exec -it rbac-mysql mysql -u rbac_user -p

Password: rbac_pass

---

## API Endpoints
| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| POST   | /api/login       | Login user             |
| GET    | /api/users       | Get users (Admin)      |
| POST   | /api/content     | Create content         |
| GET    | /api/content     | View content           |
| DELETE | /api/content/:id | Delete content (Admin) |


## Common Errors & Fixes
MySQL container not running
```bash
docker logs rbac-mysql

Reset containers
```bash
docker-compose down -v


## Security
Password hashing using bcrypt
JWT authentication
Role-based middleware protection

## Bonus Implemented
Dockerized application
Seeded database
RBAC middleware
