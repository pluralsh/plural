package config

import (
	"fmt"
	"github.com/urfave/cli"
	"gopkg.in/yaml.v2"
)

func HandleAmend(c *cli.Context) error {
	return Amend(c.Args().Get(0), c.Args().Get(1))
}

func HandleRead(c *cli.Context) error {
	conf := Read()
	d, err := yaml.Marshal(&conf)
	fmt.Printf(string(d))
	return err
}
