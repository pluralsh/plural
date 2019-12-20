package main

import (
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/urfave/cli"
	"os"
)

func build(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	for _, installation := range installations {
		if c.IsSet("only") && c.String("only") != installation.Repository.Name {
			continue
		}

		repoName := installation.Repository.Name
		utils.Warn("Building workspace for %s\n", repoName)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}
		if err := workspace.Prepare(); err != nil {
			return err
		}
		utils.Success("Finished building %s\n", repoName)
	}
	return nil
}

func deploy(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	dir, _ := os.Getwd()

	sorted, err := wkspace.Dependencies(repoName, installations)
	if err != nil {
		return err
	}

	for _, installation := range sorted {
		if installation.Repository.Name != repoName && repoName != "" {
			continue
		}

		utils.Warn("(Re)building workspace for %s\n", installation.Repository.Name)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}

		if err := workspace.InstallTerraform(); err != nil {
			return err
		}

		os.Chdir(dir)
		if err := workspace.InstallHelm(); err != nil {
			return err
		}
	}
	return nil
}


func bounce(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	dir, _ := os.Getwd()
	for _, installation := range installations {
		if installation.Repository.Name != repoName {
			continue
		}

		utils.Warn("bouncing deployments in %s\n", installation.Repository.Name)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}
		workspace.Provider.KubeConfig()

		os.Chdir(dir)
		if err := workspace.Bounce(); err != nil {
			return err
		}
	}
	return nil
}