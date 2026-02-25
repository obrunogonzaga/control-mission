package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func decodeJSON(r *http.Request, dest any) error {
	defer r.Body.Close()

	decoder := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dest); err != nil {
		return fmt.Errorf("decode json: %w", err)
	}

	if decoder.More() {
		return fmt.Errorf("decode json: unexpected extra data")
	}

	return nil
}
