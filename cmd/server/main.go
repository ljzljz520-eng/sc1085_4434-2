package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"

	"example.com/arena-emblem/internal/showcase"
	"example.com/arena-emblem/internal/web"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP listen address")
	flag.Parse()

	service := showcase.NewService()
	server := web.NewServer(service)
	displayAddr := *addr
	if strings.HasPrefix(displayAddr, ":") {
		displayAddr = "localhost" + displayAddr
	}
	fmt.Printf("arena emblem listening on http://%s\n", displayAddr)
	if err := http.ListenAndServe(*addr, server.Handler()); err != nil {
		fmt.Fprintf(os.Stderr, "server stopped: %v\n", err)
		os.Exit(1)
	}
}
