package service

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"

	"github.com/bruno/mission-control/api/db/queries"
	"github.com/bruno/mission-control/api/domain"
	"github.com/bruno/mission-control/api/sse"
)

var agentIDPattern = regexp.MustCompile(`^[a-z0-9]+$`)

// AgentService holds business rules for agent CRUD and status updates.
type AgentService struct {
	store  *queries.Store
	broker *sse.Broker
}

func NewAgentService(store *queries.Store, broker *sse.Broker) *AgentService {
	return &AgentService{store: store, broker: broker}
}

func (s *AgentService) List(ctx context.Context) ([]domain.Agent, error) {
	agents, err := s.store.ListAgents(ctx)
	if err != nil {
		return nil, fmt.Errorf("agent service: list: %w", err)
	}
	return agents, nil
}

func (s *AgentService) Create(ctx context.Context, input domain.CreateAgentInput) (domain.Agent, error) {
	id := strings.ToLower(strings.TrimSpace(input.ID))
	if id == "" || !agentIDPattern.MatchString(id) {
		return domain.Agent{}, fmt.Errorf("%w: id must be lowercase alphanumeric", ErrInvalidInput)
	}

	exists, err := s.store.AgentExists(ctx, id)
	if err != nil {
		return domain.Agent{}, fmt.Errorf("agent service: check id: %w", err)
	}
	if exists {
		return domain.Agent{}, fmt.Errorf("%w: agent already exists", ErrConflict)
	}

	agent := domain.Agent{
		ID:           id,
		Name:         strings.TrimSpace(input.Name),
		Role:         strings.TrimSpace(input.Role),
		Description:  input.Description,
		InputSignal:  input.InputSignal,
		OutputAction: input.OutputAction,
		Status:       "offline",
		SoulMD:       input.SoulMD,
		CreatedAt:    nowISO(),
	}

	if err := s.store.CreateAgent(ctx, agent); err != nil {
		return domain.Agent{}, fmt.Errorf("agent service: create: %w", err)
	}

	created, err := s.store.GetAgentByID(ctx, id)
	if err != nil {
		return domain.Agent{}, fmt.Errorf("agent service: get created: %w", err)
	}

	if s.broker != nil {
		_ = s.broker.BroadcastJSON("agents:update", created)
	}

	return created, nil
}

func (s *AgentService) Update(ctx context.Context, id string, input domain.UpdateAgentInput) (domain.Agent, error) {
	current, err := s.store.GetAgentByID(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.Agent{}, ErrNotFound
		}
		return domain.Agent{}, fmt.Errorf("agent service: get for update: %w", err)
	}

	if input.Name != nil {
		current.Name = strings.TrimSpace(*input.Name)
	}
	if input.Role != nil {
		current.Role = strings.TrimSpace(*input.Role)
	}
	if input.Description != nil {
		current.Description = *input.Description
	}
	if input.InputSignal != nil {
		current.InputSignal = *input.InputSignal
	}
	if input.OutputAction != nil {
		current.OutputAction = *input.OutputAction
	}
	if input.SoulMD != nil {
		current.SoulMD = *input.SoulMD
	}
	if input.Status != nil {
		current.Status = *input.Status
	}
	if input.LastSeenAt != nil {
		current.LastSeenAt = normalizeOptional(input.LastSeenAt)
	}

	if err := s.store.UpdateAgent(ctx, current); err != nil {
		if err == sql.ErrNoRows {
			return domain.Agent{}, ErrNotFound
		}
		return domain.Agent{}, fmt.Errorf("agent service: update: %w", err)
	}

	updated, err := s.store.GetAgentByID(ctx, id)
	if err != nil {
		return domain.Agent{}, fmt.Errorf("agent service: get updated: %w", err)
	}

	if s.broker != nil {
		_ = s.broker.BroadcastJSON("agents:update", updated)
	}

	return updated, nil
}
