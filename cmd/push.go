package main

import (
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/urfave/cli"
)

func pushCommands() []cli.Command {
	return []cli.Command{
		{
			Name:   "terraform",
			Usage:  "pushes a terraform module",
			Action: handleTerraformUpload,
		},
		{
			Name:   "helm",
			Usage:  "pushes a helm chart",
			Action: handleHelmUpload,
		},
	}
}

func handleTerraformUpload(c *cli.Context) error {
	client := api.NewUploadClient()
	_, err := client.UploadTerraform(c.Args().Get(1), c.Args().Get(0))
	return err
}

func handleHelmUpload(c *cli.Context) error {
	conf := config.Read()
	return utils.Cmd(&conf, "helm", "push", c.Args().Get(0), c.Args().Get(1))
}
