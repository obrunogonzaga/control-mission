package queries

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/bruno/mission-control/api/domain"
)

// ListAgents returns all non-archived agents with active task counts.
func (s *Store) ListAgents(ctx context.Context) ([]domain.Agent, error) {
	const query = `
		SELECT a.id, a.name, a.role, a.description, a.input_signal, a.output_action,
		       a.status, a.soul_md, a.last_seen_at, a.created_at,
		       COALESCE(SUM(CASE WHEN t.status <> 'Done' THEN 1 ELSE 0 END), 0) AS active_tasks_count
		FROM agents a
		LEFT JOIN tasks t ON t.agent_id = a.id
		WHERE a.archived_at IS NULL
		GROUP BY a.id
		ORDER BY a.name ASC
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("queries: list agents: %w", err)
	}
	defer rows.Close()

	agents := make([]domain.Agent, 0)
	for rows.Next() {
		agent, err := scanAgent(rows)
		if err != nil {
			return nil, err
		}
		agents = append(agents, agent)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("queries: list agents rows: %w", err)
	}

	return agents, nil
}

// GetAgentByID returns one agent by ID.
func (s *Store) GetAgentByID(ctx context.Context, id string) (domain.Agent, error) {
	const query = `
		SELECT a.id, a.name, a.role, a.description, a.input_signal, a.output_action,
		       a.status, a.soul_md, a.last_seen_at, a.created_at,
		       COALESCE(SUM(CASE WHEN t.status <> 'Done' THEN 1 ELSE 0 END), 0) AS active_tasks_count
		FROM agents a
		LEFT JOIN tasks t ON t.agent_id = a.id
		WHERE a.id = ?
		GROUP BY a.id
	`

	row := s.db.QueryRowContext(ctx, query, id)
	agent, err := scanAgent(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.Agent{}, sql.ErrNoRows
		}
		return domain.Agent{}, err
	}
	return agent, nil
}

func scanAgent(scanner rowScanner) (domain.Agent, error) {
	var (
		agent        domain.Agent
		description  sql.NullString
		inputSignal  sql.NullString
		outputAction sql.NullString
		soulMD       sql.NullString
		lastSeenAt   sql.NullString
		createdAt    sql.NullString
	)

	err := scanner.Scan(
		&agent.ID,
		&agent.Name,
		&agent.Role,
		&description,
		&inputSignal,
		&outputAction,
		&agent.Status,
		&soulMD,
		&lastSeenAt,
		&createdAt,
		&agent.ActiveTasksCount,
	)
	if err != nil {
		return domain.Agent{}, fmt.Errorf("queries: scan agent: %w", err)
	}

	agent.Description = description.String
	agent.InputSignal = inputSignal.String
	agent.OutputAction = outputAction.String
	agent.SoulMD = soulMD.String
	agent.LastSeenAt = pointerFromNull(lastSeenAt)
	agent.CreatedAt = createdAt.String

	return agent, nil
}
