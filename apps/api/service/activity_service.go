package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/bruno/mission-control/api/db/queries"
	"github.com/bruno/mission-control/api/domain"
	"github.com/bruno/mission-control/api/sse"
	"github.com/google/uuid"
)

// ActivityService encapsulates feed/log operations.
type ActivityService struct {
	store  *queries.Store
	broker *sse.Broker
}

func NewActivityService(store *queries.Store, broker *sse.Broker) *ActivityService {
	return &ActivityService{store: store, broker: broker}
}

func (s *ActivityService) List(ctx context.Context, filters domain.ActivityFilters) ([]domain.ActivityEntry, error) {
	entries, err := s.store.ListActivity(ctx, filters)
	if err != nil {
		return nil, fmt.Errorf("activity service: list: %w", err)
	}
	return entries, nil
}

func (s *ActivityService) Create(ctx context.Context, input domain.CreateActivityInput) (domain.ActivityEntry, error) {
	level := input.Level
	if level == "" {
		level = "info"
	}

	entry := domain.ActivityEntry{
		ID:        uuid.NewString(),
		AgentID:   cleanOptionalString(input.AgentID),
		Type:      strings.TrimSpace(input.Type),
		Message:   strings.TrimSpace(input.Message),
		Metadata:  input.Metadata,
		Level:     level,
		CreatedAt: time.Now().UTC().Format(time.RFC3339Nano),
	}

	if entry.AgentID != nil {
		exists, err := s.store.AgentExists(ctx, *entry.AgentID)
		if err != nil {
			return domain.ActivityEntry{}, fmt.Errorf("activity service: validate agent: %w", err)
		}
		if !exists {
			return domain.ActivityEntry{}, fmt.Errorf("%w: agent_id does not exist", ErrInvalidInput)
		}
	}

	if err := s.store.CreateActivity(ctx, entry); err != nil {
		return domain.ActivityEntry{}, fmt.Errorf("activity service: create: %w", err)
	}

	if entry.AgentID != nil {
		agent, err := s.store.GetAgentByID(ctx, *entry.AgentID)
		if err == nil {
			entry.AgentName = &agent.Name
		}
	}

	if s.broker != nil {
		_ = s.broker.BroadcastJSON("activity", entry)
	}

	return entry, nil
}

func cleanOptionalString(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
