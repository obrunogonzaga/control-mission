package service

import (
	"context"
	"fmt"

	"github.com/bruno/mission-control/api/db/queries"
	"github.com/bruno/mission-control/api/domain"
	"github.com/bruno/mission-control/api/sse"
)

// TaskService groups task CRUD business rules.
type TaskService struct {
	store    *queries.Store
	activity *ActivityService
	broker   *sse.Broker
}

func NewTaskService(store *queries.Store, activity *ActivityService, broker *sse.Broker) *TaskService {
	return &TaskService{store: store, activity: activity, broker: broker}
}

func (s *TaskService) List(ctx context.Context, filters domain.TaskFilters) ([]domain.Task, error) {
	tasks, err := s.store.ListTasks(ctx, filters)
	if err != nil {
		return nil, fmt.Errorf("task service: list: %w", err)
	}
	return tasks, nil
}
