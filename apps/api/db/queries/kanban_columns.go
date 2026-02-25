package queries

import (
	"context"
	"fmt"
)

func (s *Store) KanbanColumnExists(ctx context.Context, name string) (bool, error) {
	const query = `SELECT EXISTS(SELECT 1 FROM kanban_columns WHERE name = ?)`
	var exists bool
	if err := s.db.QueryRowContext(ctx, query, name).Scan(&exists); err != nil {
		return false, fmt.Errorf("queries: kanban column exists: %w", err)
	}
	return exists, nil
}

func (s *Store) FirstKanbanColumn(ctx context.Context) (string, error) {
	const query = `SELECT name FROM kanban_columns ORDER BY position ASC LIMIT 1`
	var name string
	if err := s.db.QueryRowContext(ctx, query).Scan(&name); err != nil {
		return "", fmt.Errorf("queries: first kanban column: %w", err)
	}
	return name, nil
}
