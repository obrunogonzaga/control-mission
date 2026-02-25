package middleware

import (
	"net/http"
	"strings"
)

// BearerAuth enforces Authorization: Bearer <token> for protected routes.
func BearerAuth(expectedToken string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := readToken(r)
			if token == "" || token != expectedToken {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte(`{"error":"unauthorized"}`))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func readToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		return strings.TrimSpace(authHeader[7:])
	}

	if cookie, err := r.Cookie("mission_control_token"); err == nil {
		return strings.TrimSpace(cookie.Value)
	}

	if cookie, err := r.Cookie("mc_api_token"); err == nil {
		return strings.TrimSpace(cookie.Value)
	}

	return ""
}
