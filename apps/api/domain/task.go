package domain

// Task represents one kanban card persisted in Mission Control.
type Task struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description,omitempty"`
	Status      string   `json:"status"`
	Priority    string   `json:"priority"`
	DueDate     *string  `json:"due_date,omitempty"`
	Tags        []string `json:"tags"`
	AgentID     *string  `json:"agent_id,omitempty"`
	AgentName   *string  `json:"agent_name,omitempty"`
	ProjectID   *string  `json:"project_id,omitempty"`
	ProjectName *string  `json:"project_name,omitempty"`
	CreatedBy   string   `json:"created_by"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

// TaskFilters holds query options supported by GET /api/tasks.
type TaskFilters struct {
	Status    string
	AgentID   string
	ProjectID string
	Priority  string
	DueBefore string
	DueAfter  string
	Search    string
}

// CreateTaskInput is accepted by TaskService.Create.
type CreateTaskInput struct {
	Title       string   `json:"title" validate:"required,min=3,max=200"`
	Description string   `json:"description"`
	Status      string   `json:"status"`
	Priority    string   `json:"priority" validate:"omitempty,oneof=high medium low"`
	DueDate     *string  `json:"due_date" validate:"omitempty,datetime=2006-01-02"`
	Tags        []string `json:"tags"`
	AgentID     *string  `json:"agent_id"`
	ProjectID   *string  `json:"project_id"`
	CreatedBy   string   `json:"created_by"`
}

// UpdateTaskInput includes patchable fields for a task.
type UpdateTaskInput struct {
	Title       *string   `json:"title" validate:"omitempty,min=3,max=200"`
	Description *string   `json:"description"`
	Status      *string   `json:"status"`
	Priority    *string   `json:"priority" validate:"omitempty,oneof=high medium low"`
	DueDate     *string   `json:"due_date" validate:"omitempty,datetime=2006-01-02"`
	Tags        *[]string `json:"tags"`
	AgentID     *string   `json:"agent_id"`
	ProjectID   *string   `json:"project_id"`
}
