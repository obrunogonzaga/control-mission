package handler

import (
	"errors"
	"net/http"

	"github.com/bruno/mission-control/api/service"
)

func writeServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, service.ErrNotFound):
		writeError(w, http.StatusNotFound, "resource not found")
	case errors.Is(err, service.ErrInvalidInput):
		writeError(w, http.StatusUnprocessableEntity, err.Error())
	case errors.Is(err, service.ErrConflict):
		writeError(w, http.StatusConflict, err.Error())
	default:
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
}
