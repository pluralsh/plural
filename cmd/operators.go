package main

import (
	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/operators"
	"github.com/michaeljguarino/forge/utils"
	"github.com/urfave/cli"
)

func handleShell(c *cli.Context) error {
	repo := c.Args().Get(0)
	client := api.NewClient()
	repository, err := client.GetRepository(repo)
	if err != nil {
		return err
	}

	if repository.Shell == nil {
		utils.Warn("No shell registered for %s", repo)
		return nil
	}

	return operators.Shell(repo, repository.Shell)
}


func connectDatabase(c *cli.Context) error {
	repo := c.Args().Get(0)
	client := api.NewClient()
	repository, err := client.GetRepository(repo)
	if err != nil {
		return err
	}

	if repository.Database == nil {
		utils.Warn("No shell registered for %s", repo)
		return nil
	}

	return operators.Database(repo, repository.Database)
}
