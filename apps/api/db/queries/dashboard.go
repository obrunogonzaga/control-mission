package queries

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
)

func (s *Store) CountActiveTasks(ctx context.Context) (int, error) {
	return s.countTasks(ctx, `status <> 'Done'`)
}

func (s *Store) CountInProgressTasks(ctx context.Context) (int, error) {
	return s.countTasks(ctx, `status = 'In Progress'`)
}

func (s *Store) CountDoneTasksSince(ctx context.Context, fromISO string) (int, error) {
	const query = `SELECT COUNT(*) FROM tasks WHERE status = 'Done' AND updated_at >= ?`
	var count int
	if err := s.db.QueryRowContext(ctx, query, fromISO).Scan(&count); err != nil {
		return 0, fmt.Errorf("queries: count done tasks since: %w", err)
	}
	return count, nil
}

func (s *Store) CountOverdueTasks(ctx context.Context, todayDate string) (int, error) {
	const query = `SELECT COUNT(*) FROM tasks WHERE due_date IS NOT NULL AND due_date < ? AND status <> 'Done'`
	var count int
	if err := s.db.QueryRowContext(ctx, query, todayDate).Scan(&count); err != nil {
		return 0, fmt.Errorf("queries: count overdue tasks: %w", err)
	}
	return count, nil
}

func (s *Store) WeeklyCostLimitUSD(ctx context.Context) (float64, error) {
	const query = `SELECT value FROM settings WHERE key = 'weekly_cost_limit_usd' LIMIT 1`
	var raw string
	err := s.db.QueryRowContext(ctx, query).Scan(&raw)
	if err != nil {
		if err == sql.ErrNoRows {
			return 20, nil
		}
		return 0, fmt.Errorf("queries: get weekly cost limit: %w", err)
	}

	parsed, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return 20, nil
	}
	return parsed, nil
}

func (s *Store) countTasks(ctx context.Context, where string) (int, error) {
	query := fmt.Sprintf(`SELECT COUNT(*) FROM tasks WHERE %s`, where)
	var count int
	if err := s.db.QueryRowContext(ctx, query).Scan(&count); err != nil {
		return 0, fmt.Errorf("queries: count tasks: %w", err)
	}
	return count, nil
}
