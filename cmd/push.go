package main

import (
	"fmt"
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
			ArgsUsage: "REPO path/to/module",
			Action: handleTerraformUpload,
		},
		{
			Name:   "helm",
			Usage:  "pushes a helm chart",
			ArgsUsage: "path/to/chart REPO",
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
	pth, repo := c.Args().Get(0), c.Args().Get(1)

	if err := utils.Cmd(&conf, "helm", "repo", "add", repo, fmt.Sprintf("cm://mart.piazzaapp.com/%s", repo));
			err != nil {
		return err
	}
	return utils.Cmd(&conf, "helm", "push", pth, repo)
}
