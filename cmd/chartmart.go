package main

import (
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/urfave/cli"
	"log"
	"math/rand"
	"os"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	app := cli.NewApp()
	app.Name = "chartmart"
	app.Usage = "Tooling to manage your installed chartmart applications"

	app.Commands = []cli.Command{
		{
			Name:    "build",
			Aliases: []string{"b"},
			Usage:   "builds your workspace",
			Action:  Build,
		},
		{
			Name:      "deploy",
			Aliases:   []string{"d"},
			Usage:     "deploys the current workspace",
			ArgsUsage: "WKSPACE",
			Action:    Deploy,
		},
		{
			Name:   "init",
			Usage:  "initializes charmart",
			Action: Init,
		},
		{
			Name: "crypto",
			Usage: "chartmart encryption utilities",
			Subcommands: cryptoCommands(),
		},
		{
			Name:        "push",
			Usage:       "utilities for pushing tf or helm packages",
			Subcommands: pushCommands(),
		},
		{
			Name:        "api",
			Usage:       "inspect the chartmart api",
			Subcommands: api.Commands(),
		},
		{
			Name:        "config",
			Aliases:     []string{"conf"},
			Usage:       "reads/modifies cli configuration",
			Subcommands: config.Commands(),
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
