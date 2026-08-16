package showcase

import "testing"

func TestEditableDetailsKeepCatalogStable(t *testing.T) {
	service := NewService()
	first := service.ListEditable()
	if len(first) == 0 {
		t.Fatal("expected fixture details")
	}
	original := first[0].TeamName
	first[0].TeamName = "OVERRIDE//LOCAL"
	second := service.ListEditable()
	if second[0].TeamName != original {
		t.Fatalf("catalog team name changed to %q", second[0].TeamName)
	}
}

func TestUpdateReturnsSnapshot(t *testing.T) {
	service := NewService()
	updated, err := service.Update("nova", Update{TeamName: "NOVA//X", ShortName: "NX", Season: "2026 // TEST", Motto: "STAY SHARP", Primary: "#ffffff", Secondary: "#000000", Description: "Updated"})
	if err != nil {
		t.Fatal(err)
	}
	updated.Marks[0] = "changed"
	current := service.ListEditable()
	if current[0].Marks[0] == "changed" {
		t.Fatal("returned marks changed stored detail")
	}
}

func TestUpdateUnknownDetail(t *testing.T) {
	service := NewService()
	if _, err := service.Update("missing", Update{}); err != ErrNotFound {
		t.Fatalf("expected not found, got %v", err)
	}
}
