package domain

// DashboardSummary aggregates the top-level cards and lists from Dashboard.
type DashboardSummary struct {
	Tasks        DashboardTaskSummary    `json:"tasks"`
	Cost         DashboardCostSummary    `json:"cost"`
	Sessions     DashboardSessionSummary `json:"sessions"`
	ActivityFeed []ActivityEntry         `json:"activity_feed"`
	NextCrons    []DashboardNextCron     `json:"next_crons"`
}

type DashboardTaskSummary struct {
	Total        int `json:"total"`
	InProgress   int `json:"in_progress"`
	DoneThisWeek int `json:"done_this_week"`
	Overdue      int `json:"overdue"`
}

type DashboardCostSummary struct {
	WeekUSD      float64 `json:"week_usd"`
	WeekLimitUSD float64 `json:"week_limit_usd"`
	WeekPercent  float64 `json:"week_percent"`
}

type DashboardSessionSummary struct {
	ActiveCount int `json:"active_count"`
}

// DashboardNextCron is kept for response compatibility in wave 1.
type DashboardNextCron struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	AgentID   string `json:"agent_id"`
	AgentName string `json:"agent_name"`
	NextRunAt string `json:"next_run_at"`
}
