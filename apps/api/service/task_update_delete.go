package service

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/bruno/mission-control/api/domain"
)

func (s *TaskService) Update(ctx context.Context, id string, input domain.UpdateTaskInput) (domain.Task, error) {
	current, err := s.store.GetTaskByID(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.Task{}, ErrNotFound
		}
		return domain.Task{}, fmt.Errorf("task service: get for update: %w", err)
	}
	previousStatus := current.Status

	if input.Title != nil {
		current.Title = strings.TrimSpace(*input.Title)
		if current.Title == "" {
			return domain.Task{}, fmt.Errorf("%w: title is required", ErrInvalidInput)
		}
	}
	if input.Description != nil {
		current.Description = *input.Description
	}
	if input.Status != nil {
		status := strings.TrimSpace(*input.Status)
		if err := s.validateKanbanStatus(ctx, status); err != nil {
			return domain.Task{}, err
		}
		current.Status = status
	}
	if input.Priority != nil {
		current.Priority = *input.Priority
	}
	if input.DueDate != nil {
		current.DueDate = normalizeOptional(input.DueDate)
	}
	if input.Tags != nil {
		current.Tags = *input.Tags
	}
	if input.AgentID != nil {
		current.AgentID = normalizeOptional(input.AgentID)
		if err := s.validateAgent(ctx, current.AgentID); err != nil {
			return domain.Task{}, err
		}
	}
	if input.ProjectID != nil {
		current.ProjectID = normalizeOptional(input.ProjectID)
	}
	current.UpdatedAt = nowISO()

	if err := s.store.UpdateTask(ctx, current); err != nil {
		if err == sql.ErrNoRows {
			return domain.Task{}, ErrNotFound
		}
		return domain.Task{}, fmt.Errorf("task service: update: %w", err)
	}

	updated, err := s.store.GetTaskByID(ctx, current.ID)
	if err != nil {
		return domain.Task{}, fmt.Errorf("task service: get updated task: %w", err)
	}

	activityType := "task_updated"
	activityMsg := fmt.Sprintf("Atualizou a tarefa '%s'", updated.Title)
	if previousStatus != "Done" && updated.Status == "Done" {
		activityType = "task_done"
		activityMsg = fmt.Sprintf("Concluiu a tarefa '%s'", updated.Title)
	}

	_, err = s.activity.Create(ctx, domain.CreateActivityInput{
		AgentID:  updated.AgentID,
		Type:     activityType,
		Message:  activityMsg,
		Metadata: map[string]string{"task_id": updated.ID},
		Level:    "info",
	})
	if err != nil {
		return domain.Task{}, fmt.Errorf("task service: create activity: %w", err)
	}

	if s.broker != nil {
		_ = s.broker.BroadcastJSON("tasks:update", updated)
	}

	return updated, nil
}

func (s *TaskService) Delete(ctx context.Context, id string) error {
	task, err := s.store.GetTaskByID(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return fmt.Errorf("task service: get for delete: %w", err)
	}

	deleted, err := s.store.DeleteTask(ctx, id)
	if err != nil {
		return fmt.Errorf("task service: delete: %w", err)
	}
	if !deleted {
		return ErrNotFound
	}

	_, err = s.activity.Create(ctx, domain.CreateActivityInput{
		AgentID:  task.AgentID,
		Type:     "task_updated",
		Message:  fmt.Sprintf("Removeu a tarefa '%s'", task.Title),
		Metadata: map[string]string{"task_id": task.ID},
		Level:    "warn",
	})
	if err != nil {
		return fmt.Errorf("task service: create activity: %w", err)
	}

	if s.broker != nil {
		_ = s.broker.BroadcastJSON("tasks:delete", map[string]string{"id": id})
	}

	return nil
}
