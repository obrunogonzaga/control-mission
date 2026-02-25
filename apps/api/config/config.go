package config

import (
	"fmt"
	"os"
)

// Config holds runtime settings for the API process.
type Config struct {
	Host         string
	Port         string
	APIToken     string
	CORSOrigin   string
	DatabasePath string
	Version      string
}

// Load resolves all configuration from environment variables with safe defaults.
func Load() (Config, error) {
	cfg := Config{
		Host:         getenv("API_HOST", "0.0.0.0"),
		Port:         getenv("API_PORT", "3001"),
		APIToken:     getenv("API_TOKEN", "mission-control-dev-token"),
		CORSOrigin:   getenv("CORS_ORIGIN", "http://localhost:3000"),
		DatabasePath: getenv("DATABASE_PATH", "apps/api/data/mission.db"),
		Version:      getenv("API_VERSION", "1.0.0"),
	}

	if cfg.DatabasePath == "" {
		return Config{}, fmt.Errorf("config: DATABASE_PATH cannot be empty")
	}

	return cfg, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
