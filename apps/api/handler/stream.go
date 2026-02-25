package handler

import (
	"fmt"
	"net/http"
	"time"
)

func (a *API) Stream(w http.ResponseWriter, r *http.Request) {
	if a.Broker == nil {
		writeError(w, http.StatusInternalServerError, "stream is not configured")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "SSE not supported", http.StatusInternalServerError)
		return
	}

	client := a.Broker.Register()
	defer a.Broker.Unregister(client)

	fmt.Fprintf(w, "event: connected\ndata: {\"message\":\"connected\"}\n\n")
	flusher.Flush()

	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case msg, ok := <-client:
			if !ok {
				return
			}
			fmt.Fprint(w, msg)
			flusher.Flush()
		case <-ticker.C:
			fmt.Fprintf(w, "event: ping\ndata: {\"ts\":\"%s\"}\n\n", time.Now().UTC().Format(time.RFC3339))
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}
