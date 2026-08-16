package showcase

import "errors"

var ErrNotFound = errors.New("showcase detail not found")

type Service struct {
	details []Detail
}

func NewService() *Service {
	return &Service{details: fixture()}
}

func (s *Service) ListEditable() []Detail {
	return toEditableDetails(s.details)
}

func (s *Service) Update(id string, update Update) (Detail, error) {
	for index := range s.details {
		if s.details[index].ID != id {
			continue
		}
		detail := &s.details[index]
		detail.TeamName = update.TeamName
		detail.ShortName = update.ShortName
		detail.Season = update.Season
		detail.Motto = update.Motto
		detail.Primary = update.Primary
		detail.Secondary = update.Secondary
		detail.Description = update.Description
		return detailSnapshot(*detail), nil
	}
	return Detail{}, ErrNotFound
}

func fixture() []Detail {
	return []Detail{
		{
			ID:          "nova",
			TeamName:    "NOVA//9",
			ShortName:   "N9",
			Season:      "2026 // SEASON ZERO",
			Motto:       "MAKE THE DARK OURS",
			Primary:     "#f4f0e8",
			Secondary:   "#f24b3b",
			Description: "A redline constellation built for decisive late-game calls.",
			Marks:       []string{"N", "9", "//"},
		},
		{
			ID:          "vertex",
			TeamName:    "VERTEX//SIX",
			ShortName:   "V6",
			Season:      "2026 // ALTITUDE",
			Motto:       "OWN THE ANGLE",
			Primary:     "#d9f6f2",
			Secondary:   "#0d7774",
			Description: "A high-pressure mark for the squad that never gives up the line.",
			Marks:       []string{"V", "6", "↑"},
		},
		{
			ID:          "eclipse",
			TeamName:    "ECLIPSE//BLACK",
			ShortName:   "EB",
			Season:      "2026 // AFTERLIGHT",
			Motto:       "WIN BETWEEN FRAMES",
			Primary:     "#f2d7ff",
			Secondary:   "#7626a8",
			Description: "A violet blackout that turns every frame into a finishing move.",
			Marks:       []string{"E", "B", "◒"},
		},
	}
}

func detailSnapshot(detail Detail) Detail {
	detail.Marks = append([]string(nil), detail.Marks...)
	return detail
}

func toEditableDetails(details []Detail) []Detail {
	return details[:len(details)]
}
