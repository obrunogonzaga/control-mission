package db

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"time"
)

// RunMigrations applies SQL files in lexical order exactly once.
func RunMigrations(ctx context.Context, database *sql.DB, migrationsDir string) error {
	if err := ensureMigrationsTable(ctx, database); err != nil {
		return err
	}

	files, err := migrationFiles(migrationsDir)
	if err != nil {
		return err
	}

	for _, file := range files {
		applied, err := migrationApplied(ctx, database, file)
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		content, err := os.ReadFile(filepath.Join(migrationsDir, file))
		if err != nil {
			return fmt.Errorf("db: read migration %s: %w", file, err)
		}

		tx, err := database.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("db: begin migration %s: %w", file, err)
		}

		if _, err := tx.ExecContext(ctx, string(content)); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("db: exec migration %s: %w", file, err)
		}

		if _, err := tx.ExecContext(
			ctx,
			`INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)`,
			file,
			time.Now().UTC().Format(time.RFC3339Nano),
		); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("db: record migration %s: %w", file, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("db: commit migration %s: %w", file, err)
		}
	}

	return nil
}

func ensureMigrationsTable(ctx context.Context, database *sql.DB) error {
	_, err := database.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			applied_at TEXT NOT NULL
		)
	`)
	if err != nil {
		return fmt.Errorf("db: ensure schema_migrations: %w", err)
	}

	return nil
}

func migrationFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("db: migrations dir does not exist: %s", dir)
		}
		return nil, fmt.Errorf("db: read migrations dir: %w", err)
	}

	files := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if filepath.Ext(entry.Name()) != ".sql" {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			return nil, fmt.Errorf("db: stat migration %s: %w", entry.Name(), err)
		}
		if info.Mode()&fs.ModeType != 0 {
			continue
		}
		files = append(files, entry.Name())
	}

	sort.Strings(files)
	return files, nil
}

func migrationApplied(ctx context.Context, database *sql.DB, version string) (bool, error) {
	const query = `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?)`
	var exists bool
	if err := database.QueryRowContext(ctx, query, version).Scan(&exists); err != nil {
		return false, fmt.Errorf("db: check migration %s: %w", version, err)
	}
	return exists, nil
}
