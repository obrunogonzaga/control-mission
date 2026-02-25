package handler

import (
	"net/http"

	"github.com/bruno/mission-control/api/domain"
	"github.com/go-chi/chi/v5"
)

func (a *API) ListAgents(w http.ResponseWriter, r *http.Request) {
	agents, err := a.AgentService.List(r.Context())
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"agents": agents})
}

func (a *API) CreateAgent(w http.ResponseWriter, r *http.Request) {
	var input domain.CreateAgentInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	if err := a.Validate.Struct(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	agent, err := a.AgentService.Create(r.Context(), input)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"agent": agent})
}

func (a *API) UpdateAgent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing agent id")
		return
	}

	var input domain.UpdateAgentInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON payload")
		return
	}

	if err := a.Validate.Struct(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	agent, err := a.AgentService.Update(r.Context(), id, input)
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"agent": agent})
}
