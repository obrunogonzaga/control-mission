package service

import (
	"context"
	"fmt"
	"time"

	"github.com/bruno/mission-control/api/db/queries"
	"github.com/bruno/mission-control/api/domain"
)

// DashboardService aggregates data used by GET /api/dashboard/summary.
type DashboardService struct {
	store *queries.Store
}

func NewDashboardService(store *queries.Store) *DashboardService {
	return &DashboardService{store: store}
}

func (s *DashboardService) Summary(ctx context.Context) (domain.DashboardSummary, error) {
	now := time.Now().UTC()
	startWeek := startOfWeekUTC(now).Format(time.RFC3339Nano)
	today := now.Format("2006-01-02")

	total, err := s.store.CountActiveTasks(ctx)
	if err != nil {
		return domain.DashboardSummary{}, fmt.Errorf("dashboard service: count total: %w", err)
	}
	inProgress, err := s.store.CountInProgressTasks(ctx)
	if err != nil {
		return domain.DashboardSummary{}, fmt.Errorf("dashboard service: count in progress: %w", err)
	}
	doneWeek, err := s.store.CountDoneTasksSince(ctx, startWeek)
	if err != nil {
		return domain.DashboardSummary{}, fmt.Errorf("dashboard service: count done week: %w", err)
	}
	overdue, err := s.store.CountOverdueTasks(ctx, today)
	if err != nil {
		return domain.DashboardSummary{}, fmt.Errorf("dashboard service: count overdue: %w", err)
	}

	limit, err := s.store.WeeklyCostLimitUSD(ctx)
	if err != nil {
		return domain.DashboardSummary{}, fmt.Errorf("dashboard service: weekly limit: %w", err)
	}

	activity, err := s.store.ListActivity(ctx, domain.ActivityFilters{Limit: 20})
	if err != nil {
		return domain.DashboardSummary{}, fmt.Errorf("dashboard service: activity feed: %w", err)
	}

	summary := domain.DashboardSummary{
		Tasks: domain.DashboardTaskSummary{
			Total:        total,
			InProgress:   inProgress,
			DoneThisWeek: doneWeek,
			Overdue:      overdue,
		},
		Cost: domain.DashboardCostSummary{
			WeekUSD:      0,
			WeekLimitUSD: limit,
			WeekPercent:  0,
		},
		Sessions:     domain.DashboardSessionSummary{ActiveCount: 0},
		ActivityFeed: activity,
		NextCrons:    []domain.DashboardNextCron{},
	}

	if summary.Cost.WeekLimitUSD > 0 {
		summary.Cost.WeekPercent = (summary.Cost.WeekUSD / summary.Cost.WeekLimitUSD) * 100
	}

	return summary, nil
}
