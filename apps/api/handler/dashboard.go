package handler

import "net/http"

func (a *API) DashboardSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := a.DashboardService.Summary(r.Context())
	if err != nil {
		writeServiceError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, summary)
}
