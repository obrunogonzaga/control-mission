package queries

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/bruno/mission-control/api/domain"
)

// ListActivity returns feed entries ordered by newest first.
func (s *Store) ListActivity(ctx context.Context, filters domain.ActivityFilters) ([]domain.ActivityEntry, error) {
	limit := filters.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	args := make([]any, 0, 3)
	query := strings.Builder{}
	query.WriteString(`
		SELECT ac.id, ac.agent_id, ag.name AS agent_name, ac.type, ac.message,
		       ac.metadata, ac.level, ac.created_at
		FROM activity ac
		LEFT JOIN agents ag ON ag.id = ac.agent_id
		WHERE 1=1
	`)

	if filters.AgentID != "" {
		query.WriteString(" AND ac.agent_id = ?")
		args = append(args, filters.AgentID)
	}
	if filters.Level != "" {
		query.WriteString(" AND ac.level = ?")
		args = append(args, filters.Level)
	}

	query.WriteString(" ORDER BY ac.created_at DESC LIMIT ?")
	args = append(args, limit)

	rows, err := s.db.QueryContext(ctx, query.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("queries: list activity: %w", err)
	}
	defer rows.Close()

	entries := make([]domain.ActivityEntry, 0)
	for rows.Next() {
		entry, err := scanActivity(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("queries: list activity rows: %w", err)
	}

	return entries, nil
}

func scanActivity(scanner rowScanner) (domain.ActivityEntry, error) {
	var (
		entry     domain.ActivityEntry
		agentID   sql.NullString
		agentName sql.NullString
		metadata  sql.NullString
	)

	err := scanner.Scan(
		&entry.ID,
		&agentID,
		&agentName,
		&entry.Type,
		&entry.Message,
		&metadata,
		&entry.Level,
		&entry.CreatedAt,
	)
	if err != nil {
		return domain.ActivityEntry{}, fmt.Errorf("queries: scan activity: %w", err)
	}

	entry.AgentID = pointerFromNull(agentID)
	entry.AgentName = pointerFromNull(agentName)
	if metadata.Valid && metadata.String != "" {
		var parsed any
		if err := json.Unmarshal([]byte(metadata.String), &parsed); err == nil {
			entry.Metadata = parsed
		}
	}

	return entry, nil
}
