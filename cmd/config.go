package main

import (
	"fmt"
	"github.com/urfave/cli"
	"github.com/michaeljguarino/chartmart/config"
	"gopkg.in/yaml.v2"
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
	d, err := yaml.Marshal(&conf)
	fmt.Printf(string(d))
	return err
}
