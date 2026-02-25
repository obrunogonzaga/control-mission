package service

import (
	"strings"
	"time"
)

func nowISO() string {
	return time.Now().UTC().Format(time.RFC3339Nano)
}

func startOfWeekUTC(now time.Time) time.Time {
	offset := (int(now.Weekday()) + 6) % 7 // Monday = 0
	start := now.AddDate(0, 0, -offset)
	return time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, time.UTC)
}

func normalizeOptional(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
