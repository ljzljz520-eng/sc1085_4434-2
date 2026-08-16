package showcase

type Detail struct {
	ID          string   `json:"id"`
	TeamName    string   `json:"teamName"`
	ShortName   string   `json:"shortName"`
	Season      string   `json:"season"`
	Motto       string   `json:"motto"`
	Primary     string   `json:"primary"`
	Secondary   string   `json:"secondary"`
	Description string   `json:"description"`
	Marks       []string `json:"marks"`
}

type Update struct {
	TeamName    string `json:"teamName"`
	ShortName   string `json:"shortName"`
	Season      string `json:"season"`
	Motto       string `json:"motto"`
	Primary     string `json:"primary"`
	Secondary   string `json:"secondary"`
	Description string `json:"description"`
}
