package handler

import (
	"net/http"
	"time"
)

func (a *API) Health(w http.ResponseWriter, _ *http.Request) {
	uptime := int(time.Since(a.StartedAt).Seconds())
	writeJSON(w, http.StatusOK, map[string]any{
		"status":         "ok",
		"version":        a.Version,
		"uptime_seconds": uptime,
	})
}
