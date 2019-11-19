package main

import (
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
			Flags:   []cli.Flag {
				cli.StringFlag {
					Name:  "only",
					Usage: "repository to (re)build",
				},
			},
			Action:  build,
		},
		{
			Name:      "deploy",
			Aliases:   []string{"d"},
			Usage:     "deploys the current workspace",
			ArgsUsage: "WKSPACE",
			Action:    deploy,
		},
		{
			Name:      "bounce",
			Aliases:   []string{"b"},
			Usage:     "redeploys the charts in a workspace",
			ArgsUsage: "WKSPACE",
			Action:    bounce,
		},
		{
			Name:   "init",
			Usage:  "initializes charmart",
			Action: handleInit,
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
			Subcommands: apiCommands(),
		},
		{
			Name:        "config",
			Aliases:     []string{"conf"},
			Usage:       "reads/modifies cli configuration",
			Subcommands: configCommands(),
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
