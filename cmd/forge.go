package main

import (
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/urfave/cli"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	app := cli.NewApp()
	app.Name = "forge"
	app.Usage = "Tooling to manage your installed forge applications"

	app.Commands = []cli.Command{
		{
			Name:    "build",
			Aliases: []string{"b"},
			Usage:   "builds your workspace",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "only",
					Usage: "repository to (re)build",
				},
			},
			Action: build,
		},
		{
			Name:      "deploy",
			Aliases:   []string{"d"},
			Usage:     "deploys the current workspace",
			ArgsUsage: "WKSPACE",
			Action:    deploy,
		},
		{
			Name:  "apply",
			Usage: "applys the current forgefile",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "file",
					Usage: "forgefile to use",
				},
			},
			Action: apply,
		},
		{
			Name:    "validate",
			Aliases: []string{"v"},
			Usage:   "validates your workspace",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "only",
					Usage: "repository to (re)build",
				},
			},
			Action: validate,
		},
		{
			Name:    "topsort",
			Aliases: []string{"d"},
			Usage:   "renders a dependency-inferred topological sort of the installations in a workspace",
			Action:  topsort,
		},
		{
			Name:      "bounce",
			Aliases:   []string{"b"},
			Usage:     "redeploys the charts in a workspace",
			ArgsUsage: "WKSPACE",
			Action:    bounce,
		},
		{
			Name:      "destroy",
			Aliases:   []string{"b"},
			Usage:     "iterates through all installations in reverse topological order, deleting helm installations and terraform",
			ArgsUsage: "WKSPACE",
			Action:    destroy,
		},
		{
			Name:   "init",
			Usage:  "initializes forge",
			Action: handleInit,
		},
		{
			Name:   "import",
			Usage:  "imports forge config from another file",
			Action: handleImport,
		},
		{
			Name:   "test",
			Usage:  "validate a values templace",
			Action: testTemplate,
		},
		{
			Name:      "shell",
			Aliases:   []string{"sh"},
			ArgsUsage: "REPO",
			Usage:     "opens a ssh connection to a running deployed pod",
			Action:    handleShell,
		},
		{
			Name:      "database",
			Aliases:   []string{"db"},
			ArgsUsage: "REPO",
			Usage:     "opens a ssh connection to a running deployed pod",
			Action:    connectDatabase,
		},
		{
			Name:        "crypto",
			Usage:       "forge encryption utilities",
			Subcommands: cryptoCommands(),
		},
		{
			Name:        "push",
			Usage:       "utilities for pushing tf or helm packages",
			Subcommands: pushCommands(),
		},
		{
			Name:        "api",
			Usage:       "inspect the forge api",
			Subcommands: apiCommands(),
		},
		{
			Name:        "config",
			Aliases:     []string{"conf"},
			Usage:       "reads/modifies cli configuration",
			Subcommands: configCommands(),
		},
		{
			Name:        "workspace",
			Aliases:     []string{"wkspace"},
			Usage:       "Commands for managing installations in your workspace",
			Subcommands: workspaceCommands(),
		},
		{
			Name:    "webhook",
			Aliases: []string{"wh"},
			Usage:   "Posts to a watchman webhook",
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "secret",
					Usage: "the hmac secret to use",
				},
				cli.StringFlag{
					Name:  "url",
					Usage: "the url for your watchman instance",
				},
			},
			Action: handleWebhook,
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
