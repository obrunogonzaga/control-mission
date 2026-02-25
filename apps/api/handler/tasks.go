package handler

import (
	"net/http"
	"strconv"

	"github.com/bruno/mission-control/api/domain"
	"github.com/go-chi/chi/v5"
)

func (a *API) ListTasks(w http.ResponseWriter, r *http.Request) {
	filters := domain.TaskFilters{
		Status:    r.URL.Query().Get("status"),
		AgentID:   r.URL.Query().Get("agent_id"),
		ProjectID: r.URL.Query().Get("project_id"),
		Priority:  r.URL.Query().Get("priority"),
		DueBefore: r.URL.Query().Get("due_before"),
		DueAfter:  r.URL.Query().Get("due_after"),
		Search:    r.URL.Query().Get("search"),
	}

	tasks, err := a.TaskService.List(r.Context(), filters)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"tasks": tasks, "total": len(tasks)})
}

func (a *API) CreateTask(w http.ResponseWriter, r *http.Request) {
	var input domain.CreateTaskInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	if err := a.Validate.Struct(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	task, err := a.TaskService.Create(r.Context(), input)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"task": task})
}

func (a *API) UpdateTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing task id")
		return
	}

	var input domain.UpdateTaskInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	if err := a.Validate.Struct(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	task, err := a.TaskService.Update(r.Context(), id, input)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"task": task})
}

func (a *API) DeleteTask(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing task id")
		return
	}

	if err := a.TaskService.Delete(r.Context(), id); err != nil {
		writeServiceError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func parsePositiveInt(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}
