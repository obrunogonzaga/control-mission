package queries

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/bruno/mission-control/api/domain"
)

// CreateActivity inserts one entry in the activity feed.
func (s *Store) CreateActivity(ctx context.Context, entry domain.ActivityEntry) error {
	metadata := ""
	if entry.Metadata != nil {
		bytes, err := json.Marshal(entry.Metadata)
		if err != nil {
			return fmt.Errorf("queries: marshal activity metadata: %w", err)
		}
		metadata = string(bytes)
	}

	const query = `
		INSERT INTO activity (id, agent_id, type, message, metadata, level, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := s.db.ExecContext(
		ctx,
		query,
		entry.ID,
		nullableString(entry.AgentID),
		entry.Type,
		entry.Message,
		metadata,
		entry.Level,
		entry.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("queries: create activity: %w", err)
	}

	return nil
}
