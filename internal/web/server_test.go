package web

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"example.com/arena-emblem/internal/showcase"
)

func TestListAndUpdateShowcases(t *testing.T) {
	service := showcase.NewService()
	handler := NewServer(service).Handler()

	list := httptest.NewRecorder()
	handler.ServeHTTP(list, httptest.NewRequest(http.MethodGet, "/api/showcases", nil))
	if list.Code != http.StatusOK {
		t.Fatalf("list status = %d", list.Code)
	}
	var response struct {
		Items []showcase.Detail `json:"items"`
	}
	if err := json.NewDecoder(list.Body).Decode(&response); err != nil {
		t.Fatal(err)
	}
	if len(response.Items) != 3 || response.Items[0].ID != "nova" {
		t.Fatalf("unexpected fixture response: %+v", response.Items)
	}

	body := `{"teamName":"NOVA//PRIME","shortName":"NP","season":"2026 // PRIME","motto":"LOCK THE LANE","primary":"#eeeeee","secondary":"#dd3322","description":"Prime roster reveal."}`
	update := httptest.NewRecorder()
	handler.ServeHTTP(update, httptest.NewRequest(http.MethodPut, "/api/showcases/nova", strings.NewReader(body)))
	if update.Code != http.StatusOK {
		t.Fatalf("update status = %d: %s", update.Code, update.Body.String())
	}

	current := service.ListEditable()
	if current[0].TeamName != "NOVA//PRIME" || current[0].Motto != "LOCK THE LANE" {
		t.Fatalf("update not applied: %+v", current[0])
	}
}

func TestUpdateRejectsUnknownDetail(t *testing.T) {
	handler := NewServer(showcase.NewService()).Handler()
	body := `{"teamName":"X","shortName":"X","season":"X","motto":"X","primary":"#fff","secondary":"#000","description":"X"}`
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodPut, "/api/showcases/missing", strings.NewReader(body)))
	if response.Code != http.StatusNotFound {
		t.Fatalf("status = %d", response.Code)
	}
}

func TestEmbeddedInterface(t *testing.T) {
	handler := NewServer(showcase.NewService()).Handler()
	for _, path := range []string{"/", "/assets/app.js", "/assets/styles.css"} {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, path, nil))
		if response.Code != http.StatusOK || response.Body.Len() == 0 {
			t.Fatalf("asset %s returned %d with %d bytes", path, response.Code, response.Body.Len())
		}
	}
}
