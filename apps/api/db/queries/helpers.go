package queries

import (
	"database/sql"
	"encoding/json"
	"fmt"
)

func marshalTags(tags []string) (string, error) {
	if len(tags) == 0 {
		return "[]", nil
	}
	bytes, err := json.Marshal(tags)
	if err != nil {
		return "", fmt.Errorf("queries: marshal tags: %w", err)
	}
	return string(bytes), nil
}

func unmarshalTags(raw string) ([]string, error) {
	if raw == "" {
		return []string{}, nil
	}
	var tags []string
	if err := json.Unmarshal([]byte(raw), &tags); err != nil {
		return nil, fmt.Errorf("queries: unmarshal tags: %w", err)
	}
	if tags == nil {
		return []string{}, nil
	}
	return tags, nil
}

func nullableString(value *string) sql.NullString {
	if value == nil {
		return sql.NullString{}
	}
	return sql.NullString{String: *value, Valid: true}
}

func pointerFromNull(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	v := value.String
	return &v
}
