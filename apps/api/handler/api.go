package handler

import (
	"time"

	"github.com/bruno/mission-control/api/service"
	"github.com/bruno/mission-control/api/sse"
	"github.com/go-playground/validator/v10"
)

// API wires HTTP handlers to underlying services.
type API struct {
	Validate         *validator.Validate
	Version          string
	StartedAt        time.Time
	TaskService      *service.TaskService
	AgentService     *service.AgentService
	ActivityService  *service.ActivityService
	DashboardService *service.DashboardService
	Broker           *sse.Broker
}
