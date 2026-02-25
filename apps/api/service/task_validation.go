package service

import (
	"context"
	"fmt"
)

func (s *TaskService) validateKanbanStatus(ctx context.Context, status string) error {
	exists, err := s.store.KanbanColumnExists(ctx, status)
	if err != nil {
		return fmt.Errorf("task service: validate status: %w", err)
	}
	if !exists {
		return fmt.Errorf("%w: status does not match any kanban column", ErrInvalidInput)
	}
	return nil
}

func (s *TaskService) validateAgent(ctx context.Context, agentID *string) error {
	if agentID == nil {
		return nil
	}
	exists, err := s.store.AgentExists(ctx, *agentID)
	if err != nil {
		return fmt.Errorf("task service: validate agent: %w", err)
	}
	if !exists {
		return fmt.Errorf("%w: agent_id does not exist", ErrInvalidInput)
	}
	return nil
}
