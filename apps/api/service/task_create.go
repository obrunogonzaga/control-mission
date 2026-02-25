package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/bruno/mission-control/api/domain"
	"github.com/google/uuid"
)

func (s *TaskService) Create(ctx context.Context, input domain.CreateTaskInput) (domain.Task, error) {
	title := strings.TrimSpace(input.Title)
	if title == "" {
		return domain.Task{}, fmt.Errorf("%w: title is required", ErrInvalidInput)
	}

	status := strings.TrimSpace(input.Status)
	if status == "" {
		first, err := s.store.FirstKanbanColumn(ctx)
		if err != nil {
			return domain.Task{}, fmt.Errorf("task service: first kanban column: %w", err)
		}
		status = first
	}
	if err := s.validateKanbanStatus(ctx, status); err != nil {
		return domain.Task{}, err
	}

	agentID := normalizeOptional(input.AgentID)
	if err := s.validateAgent(ctx, agentID); err != nil {
		return domain.Task{}, err
	}

	priority := input.Priority
	if priority == "" {
		priority = "medium"
	}

	createdBy := strings.TrimSpace(input.CreatedBy)
	if createdBy == "" {
		createdBy = "user"
	}

	now := nowISO()
	task := domain.Task{
		ID:          uuid.NewString(),
		Title:       title,
		Description: input.Description,
		Status:      status,
		Priority:    priority,
		DueDate:     normalizeOptional(input.DueDate),
		Tags:        input.Tags,
		AgentID:     agentID,
		ProjectID:   normalizeOptional(input.ProjectID),
		CreatedBy:   createdBy,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.store.CreateTask(ctx, task); err != nil {
		return domain.Task{}, fmt.Errorf("task service: create: %w", err)
	}

	created, err := s.store.GetTaskByID(ctx, task.ID)
	if err != nil {
		return domain.Task{}, fmt.Errorf("task service: get created task: %w", err)
	}

	_, err = s.activity.Create(ctx, domain.CreateActivityInput{
		AgentID:  created.AgentID,
		Type:     "task_created",
		Message:  fmt.Sprintf("Criou a tarefa '%s'", created.Title),
		Metadata: map[string]string{"task_id": created.ID},
		Level:    "info",
	})
	if err != nil {
		return domain.Task{}, fmt.Errorf("task service: create activity: %w", err)
	}

	if s.broker != nil {
		_ = s.broker.BroadcastJSON("tasks:update", created)
	}

	return created, nil
}
