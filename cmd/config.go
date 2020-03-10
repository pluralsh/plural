package main

import (
	"github.com/michaeljguarino/forge/config"
	"github.com/urfave/cli"
	"os"
)

func configCommands() []cli.Command {
	return []cli.Command{
		{
			Name:      "amend",
			Usage:     "modify config",
			ArgsUsage: "[key] [value]",
			Action:    handleAmend,
		},
		{
			Name:      "read",
			Usage:     "dumps config",
			ArgsUsage: "",
			Action:    handleRead,
		},
	}
}

func handleAmend(c *cli.Context) error {
	return config.Amend(c.Args().Get(0), c.Args().Get(1))
}

func handleRead(c *cli.Context) error {
	conf := config.Read()
	d, err := conf.Marshal()
	if err != nil {
		return err
	}

	os.Stdout.Write(d)
	return nil
}
