package web

import (
	"encoding/json"
	"errors"
	"io/fs"
	"net/http"
	"strings"

	"example.com/arena-emblem/internal/showcase"
	webui "example.com/arena-emblem/web"
	"github.com/go-chi/chi/v5"
)

type Server struct {
	showcase *showcase.Service
}

func NewServer(service *showcase.Service) *Server {
	return &Server{showcase: service}
}

func (s *Server) Handler() http.Handler {
	router := chi.NewRouter()
	router.Get("/api/health", s.health)
	router.Get("/api/showcases", s.listShowcases)
	router.Put("/api/showcases/{id}", s.updateShowcase)
	router.Get("/assets/app.js", asset("src/app.js", "text/javascript; charset=utf-8"))
	router.Get("/assets/styles.css", asset("src/styles.css", "text/css; charset=utf-8"))
	router.Get("/", asset("index.html", "text/html; charset=utf-8"))
	return router
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (s *Server) listShowcases(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"items": s.showcase.ListEditable()})
}

func (s *Server) updateShowcase(w http.ResponseWriter, r *http.Request) {
	var update showcase.Update
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 32<<10))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&update); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid detail payload"})
		return
	}
	if invalidUpdate(update) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "all text and color fields are required"})
		return
	}
	detail, err := s.showcase.Update(chi.URLParam(r, "id"), update)
	if errors.Is(err, showcase.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, detail)
}

func invalidUpdate(update showcase.Update) bool {
	return strings.TrimSpace(update.TeamName) == "" ||
		strings.TrimSpace(update.ShortName) == "" ||
		strings.TrimSpace(update.Season) == "" ||
		strings.TrimSpace(update.Motto) == "" ||
		strings.TrimSpace(update.Primary) == "" ||
		strings.TrimSpace(update.Secondary) == "" ||
		strings.TrimSpace(update.Description) == ""
}

func asset(name, contentType string) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		content, err := fs.ReadFile(webui.Assets, name)
		if err != nil {
			http.Error(w, "asset unavailable", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(content)
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
