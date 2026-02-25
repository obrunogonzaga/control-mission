package queries

import "database/sql"

// Store exposes SQL operations grouped by entity.
type Store struct {
	db *sql.DB
}

func New(db *sql.DB) *Store {
	return &Store{db: db}
}
