package queries

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/bruno/mission-control/api/domain"
)

// ListTasks returns tasks using optional filters from query params.
func (s *Store) ListTasks(ctx context.Context, filters domain.TaskFilters) ([]domain.Task, error) {
	args := make([]any, 0, 8)
	query := strings.Builder{}
	query.WriteString(`
		SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.tags,
		       t.agent_id, a.name AS agent_name, t.project_id, t.created_by, t.created_at, t.updated_at
		FROM tasks t
		LEFT JOIN agents a ON a.id = t.agent_id
		WHERE 1=1
	`)

	if filters.Status != "" {
		query.WriteString(" AND t.status = ?")
		args = append(args, filters.Status)
	}
	if filters.AgentID != "" {
		query.WriteString(" AND t.agent_id = ?")
		args = append(args, filters.AgentID)
	}
	if filters.ProjectID != "" {
		query.WriteString(" AND t.project_id = ?")
		args = append(args, filters.ProjectID)
	}
	if filters.Priority != "" {
		query.WriteString(" AND t.priority = ?")
		args = append(args, filters.Priority)
	}
	if filters.DueBefore != "" {
		query.WriteString(" AND t.due_date <= ?")
		args = append(args, filters.DueBefore)
	}
	if filters.DueAfter != "" {
		query.WriteString(" AND t.due_date >= ?")
		args = append(args, filters.DueAfter)
	}
	if filters.Search != "" {
		query.WriteString(" AND (LOWER(t.title) LIKE ? OR LOWER(COALESCE(t.description, '')) LIKE ?)")
		search := "%" + strings.ToLower(filters.Search) + "%"
		args = append(args, search, search)
	}

	query.WriteString(" ORDER BY t.created_at DESC")

	rows, err := s.db.QueryContext(ctx, query.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("queries: list tasks: %w", err)
	}
	defer rows.Close()

	tasks := make([]domain.Task, 0)
	for rows.Next() {
		task, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("queries: list tasks rows: %w", err)
	}

	return tasks, nil
}

// GetTaskByID returns one task by ID.
func (s *Store) GetTaskByID(ctx context.Context, id string) (domain.Task, error) {
	const query = `
		SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.tags,
		       t.agent_id, a.name AS agent_name, t.project_id, t.created_by, t.created_at, t.updated_at
		FROM tasks t
		LEFT JOIN agents a ON a.id = t.agent_id
		WHERE t.id = ?
	`

	row := s.db.QueryRowContext(ctx, query, id)
	task, err := scanTask(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.Task{}, sql.ErrNoRows
		}
		return domain.Task{}, err
	}

	return task, nil
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanTask(scanner rowScanner) (domain.Task, error) {
	var (
		task        domain.Task
		tagsRaw     string
		description sql.NullString
		dueDate     sql.NullString
		agentID     sql.NullString
		agentName   sql.NullString
		projectID   sql.NullString
	)

	err := scanner.Scan(
		&task.ID,
		&task.Title,
		&description,
		&task.Status,
		&task.Priority,
		&dueDate,
		&tagsRaw,
		&agentID,
		&agentName,
		&projectID,
		&task.CreatedBy,
		&task.CreatedAt,
		&task.UpdatedAt,
	)
	if err != nil {
		return domain.Task{}, fmt.Errorf("queries: scan task: %w", err)
	}

	tags, err := unmarshalTags(tagsRaw)
	if err != nil {
		return domain.Task{}, err
	}

	task.Tags = tags
	task.Description = description.String
	task.DueDate = pointerFromNull(dueDate)
	task.AgentID = pointerFromNull(agentID)
	task.AgentName = pointerFromNull(agentName)
	task.ProjectID = pointerFromNull(projectID)

	return task, nil
}
