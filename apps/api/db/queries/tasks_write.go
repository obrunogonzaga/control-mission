package queries

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/bruno/mission-control/api/domain"
)

// CreateTask inserts a new task row.
func (s *Store) CreateTask(ctx context.Context, task domain.Task) error {
	tags, err := marshalTags(task.Tags)
	if err != nil {
		return err
	}

	const query = `
		INSERT INTO tasks (
			id, title, description, status, priority, due_date, tags,
			agent_id, project_id, created_by, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err = s.db.ExecContext(
		ctx,
		query,
		task.ID,
		task.Title,
		task.Description,
		task.Status,
		task.Priority,
		nullableString(task.DueDate),
		tags,
		nullableString(task.AgentID),
		nullableString(task.ProjectID),
		task.CreatedBy,
		task.CreatedAt,
		task.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("queries: create task: %w", err)
	}

	return nil
}

// UpdateTask updates the mutable fields of a task.
func (s *Store) UpdateTask(ctx context.Context, task domain.Task) error {
	tags, err := marshalTags(task.Tags)
	if err != nil {
		return err
	}

	const query = `
		UPDATE tasks
		SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, tags = ?,
		    agent_id = ?, project_id = ?, updated_at = ?
		WHERE id = ?
	`

	result, err := s.db.ExecContext(
		ctx,
		query,
		task.Title,
		task.Description,
		task.Status,
		task.Priority,
		nullableString(task.DueDate),
		tags,
		nullableString(task.AgentID),
		nullableString(task.ProjectID),
		task.UpdatedAt,
		task.ID,
	)
	if err != nil {
		return fmt.Errorf("queries: update task: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("queries: update task rows affected: %w", err)
	}
	if affected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// DeleteTask deletes one task by ID and reports whether the row existed.
func (s *Store) DeleteTask(ctx context.Context, id string) (bool, error) {
	result, err := s.db.ExecContext(ctx, `DELETE FROM tasks WHERE id = ?`, id)
	if err != nil {
		return false, fmt.Errorf("queries: delete task: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("queries: delete task rows affected: %w", err)
	}

	return affected > 0, nil
}
