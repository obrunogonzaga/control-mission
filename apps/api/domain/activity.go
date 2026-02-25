package domain

// ActivityEntry appears in dashboard feeds and logs.
type ActivityEntry struct {
	ID        string  `json:"id"`
	AgentID   *string `json:"agent_id,omitempty"`
	AgentName *string `json:"agent_name,omitempty"`
	Type      string  `json:"type"`
	Message   string  `json:"message"`
	Metadata  any     `json:"metadata,omitempty"`
	Level     string  `json:"level"`
	CreatedAt string  `json:"created_at"`
}

// CreateActivityInput is accepted by ActivityService.Create.
type CreateActivityInput struct {
	AgentID  *string `json:"agent_id"`
	Type     string  `json:"type" validate:"required,min=2,max=50"`
	Message  string  `json:"message" validate:"required,min=2,max=500"`
	Metadata any     `json:"metadata"`
	Level    string  `json:"level" validate:"omitempty,oneof=info warn error"`
}

// ActivityFilters keeps query params for /api/activity.
type ActivityFilters struct {
	AgentID string
	Level   string
	Limit   int
}
