package api

import (
  "github.com/urfave/cli"
)

func Commands() []cli.Command {
	return []cli.Command{
		{
			Name:    "installations",
			Usage:   "lists the repos you have installed",
			ArgsUsage: "",
      Action:  HandleInstallations,
		},
	}
}