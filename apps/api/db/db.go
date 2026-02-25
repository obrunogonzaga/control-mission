package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// Open creates the SQLite connection and configures pragmas used by the API.
func Open(path string) (*sql.DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, fmt.Errorf("db: create data dir: %w", err)
	}

	database, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("db: open sqlite: %w", err)
	}

	if _, err := database.Exec("PRAGMA journal_mode=WAL;"); err != nil {
		_ = database.Close()
		return nil, fmt.Errorf("db: enable WAL: %w", err)
	}

	if _, err := database.Exec("PRAGMA foreign_keys=ON;"); err != nil {
		_ = database.Close()
		return nil, fmt.Errorf("db: enable foreign keys: %w", err)
	}

	if err := database.Ping(); err != nil {
		_ = database.Close()
		return nil, fmt.Errorf("db: ping sqlite: %w", err)
	}

	return database, nil
}
