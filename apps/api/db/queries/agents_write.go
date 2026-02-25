package queries

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/bruno/mission-control/api/domain"
)

// CreateAgent inserts a new agent row.
func (s *Store) CreateAgent(ctx context.Context, agent domain.Agent) error {
	const query = `
		INSERT INTO agents (
			id, name, role, description, input_signal, output_action,
			status, soul_md, last_seen_at, archived_at, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
	`

	_, err := s.db.ExecContext(
		ctx,
		query,
		agent.ID,
		agent.Name,
		agent.Role,
		agent.Description,
		agent.InputSignal,
		agent.OutputAction,
		agent.Status,
		agent.SoulMD,
		nullableString(agent.LastSeenAt),
		agent.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("queries: create agent: %w", err)
	}
	return nil
}

// UpdateAgent updates mutable fields in one agent.
func (s *Store) UpdateAgent(ctx context.Context, agent domain.Agent) error {
	const query = `
		UPDATE agents
		SET name = ?, role = ?, description = ?, input_signal = ?, output_action = ?,
		    status = ?, soul_md = ?, last_seen_at = ?
		WHERE id = ? AND archived_at IS NULL
	`

	result, err := s.db.ExecContext(
		ctx,
		query,
		agent.Name,
		agent.Role,
		agent.Description,
		agent.InputSignal,
		agent.OutputAction,
		agent.Status,
		agent.SoulMD,
		nullableString(agent.LastSeenAt),
		agent.ID,
	)
	if err != nil {
		return fmt.Errorf("queries: update agent: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("queries: update agent rows affected: %w", err)
	}
	if affected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// AgentExists checks if agent ID exists and is not archived.
func (s *Store) AgentExists(ctx context.Context, id string) (bool, error) {
	const query = `SELECT EXISTS(SELECT 1 FROM agents WHERE id = ? AND archived_at IS NULL)`
	var exists bool
	if err := s.db.QueryRowContext(ctx, query, id).Scan(&exists); err != nil {
		return false, fmt.Errorf("queries: agent exists: %w", err)
	}
	return exists, nil
}
