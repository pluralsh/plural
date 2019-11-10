package config

import (
  "github.com/urfave/cli"
)

func Commands() []cli.Command {
	return []cli.Command{
		{
			Name:  "amend",
			Usage: "modify config",
			ArgsUsage: "[key] [value]",
			Action: HandleAmend,
		},
		{
			Name:  "read",
			Usage: "dumps config",
			ArgsUsage: "",
			Action: HandleRead,
		},
	}
}