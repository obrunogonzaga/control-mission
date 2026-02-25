package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/bruno/mission-control/api/config"
	"github.com/bruno/mission-control/api/db"
	"github.com/bruno/mission-control/api/db/queries"
	"github.com/bruno/mission-control/api/handler"
	appmiddleware "github.com/bruno/mission-control/api/middleware"
	"github.com/bruno/mission-control/api/service"
	"github.com/bruno/mission-control/api/sse"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-playground/validator/v10"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	database, err := db.Open(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer database.Close()

	migrationsDir, err := resolveMigrationsDir()
	if err != nil {
		log.Fatalf("failed to locate migrations dir: %v", err)
	}

	if err := db.RunMigrations(context.Background(), database, migrationsDir); err != nil {
		log.Fatalf("failed to apply migrations: %v", err)
	}

	store := queries.New(database)
	broker := sse.NewBroker()

	activityService := service.NewActivityService(store, broker)
	taskService := service.NewTaskService(store, activityService, broker)
	agentService := service.NewAgentService(store, broker)
	dashboardService := service.NewDashboardService(store)

	api := &handler.API{
		Validate:         validator.New(validator.WithRequiredStructEnabled()),
		Version:          cfg.Version,
		StartedAt:        time.Now().UTC(),
		TaskService:      taskService,
		AgentService:     agentService,
		ActivityService:  activityService,
		DashboardService: dashboardService,
		Broker:           broker,
	}

	router := chi.NewRouter()
	router.Use(chimw.RequestID)
	router.Use(chimw.RealIP)
	router.Use(chimw.Logger)
	router.Use(chimw.Recoverer)
	router.Use(appmiddleware.CORS(cfg.CORSOrigin))

	router.Get("/health", api.Health)

	router.Route("/api", func(r chi.Router) {
		r.Use(appmiddleware.BearerAuth(cfg.APIToken))

		r.Get("/dashboard/summary", api.DashboardSummary)

		r.Get("/tasks", api.ListTasks)
		r.Post("/tasks", api.CreateTask)
		r.Patch("/tasks/{id}", api.UpdateTask)
		r.Delete("/tasks/{id}", api.DeleteTask)

		r.Get("/agents", api.ListAgents)
		r.Post("/agents", api.CreateAgent)
		r.Patch("/agents/{id}", api.UpdateAgent)

		r.Get("/activity", api.ListActivity)
		r.Post("/activity", api.CreateActivity)

		r.Get("/stream", api.Stream)
	})

	// Compatibility aliases for wave-plan core endpoints.
	router.Group(func(r chi.Router) {
		r.Use(appmiddleware.BearerAuth(cfg.APIToken))
		r.Get("/dashboard/summary", api.DashboardSummary)

		r.Get("/tasks", api.ListTasks)
		r.Post("/tasks", api.CreateTask)
		r.Patch("/tasks/{id}", api.UpdateTask)
		r.Delete("/tasks/{id}", api.DeleteTask)

		r.Get("/agents", api.ListAgents)
		r.Post("/agents", api.CreateAgent)
		r.Patch("/agents/{id}", api.UpdateAgent)

		r.Get("/activity", api.ListActivity)
		r.Post("/activity", api.CreateActivity)
	})

	server := &http.Server{
		Addr:              cfg.Host + ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("mission-control API listening on http://%s", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failure: %v", err)
		}
	}()

	shutdownSignals := make(chan os.Signal, 1)
	signal.Notify(shutdownSignals, syscall.SIGINT, syscall.SIGTERM)
	<-shutdownSignals

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown error: %v", err)
	}
}

func resolveMigrationsDir() (string, error) {
	candidates := []string{
		"migrations",
		filepath.Join("apps", "api", "migrations"),
	}

	for _, candidate := range candidates {
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate, nil
		}
	}

	return "", os.ErrNotExist
}
