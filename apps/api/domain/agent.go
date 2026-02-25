package domain

// Agent represents one OpenClaw agent configuration row.
type Agent struct {
	ID               string  `json:"id"`
	Name             string  `json:"name"`
	Role             string  `json:"role"`
	Description      string  `json:"description,omitempty"`
	InputSignal      string  `json:"input_signal,omitempty"`
	OutputAction     string  `json:"output_action,omitempty"`
	Status           string  `json:"status"`
	SoulMD           string  `json:"soul_md,omitempty"`
	LastSeenAt       *string `json:"last_seen_at,omitempty"`
	ActiveTasksCount int     `json:"active_tasks_count"`
	CreatedAt        string  `json:"created_at,omitempty"`
}

// CreateAgentInput is accepted by AgentService.Create.
type CreateAgentInput struct {
	ID           string `json:"id" validate:"required"`
	Name         string `json:"name" validate:"required,min=2,max=50"`
	Role         string `json:"role" validate:"required,min=2,max=100"`
	Description  string `json:"description"`
	InputSignal  string `json:"input_signal"`
	OutputAction string `json:"output_action"`
	SoulMD       string `json:"soul_md"`
}

// UpdateAgentInput allows partial updates for agents.
type UpdateAgentInput struct {
	Name         *string `json:"name" validate:"omitempty,min=2,max=50"`
	Role         *string `json:"role" validate:"omitempty,min=2,max=100"`
	Description  *string `json:"description"`
	InputSignal  *string `json:"input_signal"`
	OutputAction *string `json:"output_action"`
	SoulMD       *string `json:"soul_md"`
	Status       *string `json:"status" validate:"omitempty,oneof=online offline running"`
	LastSeenAt   *string `json:"last_seen_at" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
}
