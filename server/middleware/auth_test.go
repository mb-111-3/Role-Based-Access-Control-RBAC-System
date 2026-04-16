package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"rbac/middleware"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() { gin.SetMode(gin.TestMode) }

func makeToken(role string, expired bool) string {
	exp := time.Now().Add(24 * time.Hour)
	if expired {
		exp = time.Now().Add(-1 * time.Hour)
	}
	claims := &middleware.Claims{
		UserID:   1,
		Username: "testuser",
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString(middleware.GetSecret())
	return signed
}

func newRouter(handler gin.HandlerFunc, roles ...string) *gin.Engine {
	r := gin.New()
	mw := []gin.HandlerFunc{middleware.AuthRequired()}
	if len(roles) > 0 {
		mw = append(mw, middleware.RequireRole(roles...))
	}
	r.GET("/test", append(mw, handler)...)
	return r
}

func TestAuthRequired_NoToken(t *testing.T) {
	r := newRouter(func(c *gin.Context) { c.Status(200) })
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthRequired_InvalidToken(t *testing.T) {
	r := newRouter(func(c *gin.Context) { c.Status(200) })
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid.token.here")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthRequired_ExpiredToken(t *testing.T) {
	r := newRouter(func(c *gin.Context) { c.Status(200) })
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+makeToken("admin", true))
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthRequired_ValidToken(t *testing.T) {
	r := newRouter(func(c *gin.Context) { c.Status(200) })
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+makeToken("admin", false))
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestRequireRole_Allowed(t *testing.T) {
	r := newRouter(func(c *gin.Context) { c.Status(200) }, "admin", "editor")
	for _, role := range []string{"admin", "editor"} {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/test", nil)
		req.Header.Set("Authorization", "Bearer "+makeToken(role, false))
		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("role %s: expected 200, got %d", role, w.Code)
		}
	}
}

func TestRequireRole_Forbidden(t *testing.T) {
	r := newRouter(func(c *gin.Context) { c.Status(200) }, "admin")
	for _, role := range []string{"editor", "viewer"} {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/test", nil)
		req.Header.Set("Authorization", "Bearer "+makeToken(role, false))
		r.ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Errorf("role %s: expected 403, got %d", role, w.Code)
		}
	}
}

func TestClaimsInjected(t *testing.T) {
	r := newRouter(func(c *gin.Context) {
		role, _ := c.Get("role")
		username, _ := c.Get("username")
		if role != "editor" || username != "testuser" {
			c.Status(500)
			return
		}
		c.Status(200)
	})
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+makeToken("editor", false))
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
