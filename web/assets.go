package webui

import "embed"

//go:embed index.html src/app.js src/styles.css
var Assets embed.FS
