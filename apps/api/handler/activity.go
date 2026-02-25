package handler

import (
	"net/http"

	"github.com/bruno/mission-control/api/domain"
)

func (a *API) ListActivity(w http.ResponseWriter, r *http.Request) {
	filters := domain.ActivityFilters{
		AgentID: r.URL.Query().Get("agent_id"),
		Level:   r.URL.Query().Get("level"),
		Limit:   parsePositiveInt(r.URL.Query().Get("limit"), 50),
	}

	entries, err := a.ActivityService.List(r.Context(), filters)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"activity": entries, "total": len(entries)})
}

func (a *API) CreateActivity(w http.ResponseWriter, r *http.Request) {
	var input domain.CreateActivityInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	if err := a.Validate.Struct(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	entry, err := a.ActivityService.Create(r.Context(), input)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"activity": entry})
}
