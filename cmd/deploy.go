package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/scaffold"
	"github.com/michaeljguarino/forge/utils"
	"github.com/michaeljguarino/forge/wkspace"
	"github.com/urfave/cli"
)

func build(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	sorted, err := wkspace.Dependencies("", installations)
	if err != nil {
		sorted = installations // we don't know all the dependencies yet
	}

	for _, installation := range sorted {
		if c.IsSet("only") && c.String("only") != installation.Repository.Name {
			continue
		}

		repoName := installation.Repository.Name
		fmt.Printf("Building workspace for %s\n", repoName)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}

		if err := workspace.Prepare(); err != nil {
			return err
		}

		build, err := scaffold.Scaffolds(workspace)
		if err != nil {
			return err
		}

		if err := build.Execute(workspace); err != nil {
			return err
		}

		utils.Success("Finished building %s\n\n", repoName)
	}
	return nil
}

func validate(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	for _, installation := range installations {
		if c.IsSet("only") && c.String("only") != installation.Repository.Name {
			continue
		}

		utils.Highlight("Validating repository %s\n", installation.Repository.Name)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}
		if err := workspace.Validate(); err != nil {
			return err
		}
	}
	utils.Success("Workspace providers are properly configured!\n")
	return nil
}

func deploy(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	sorted, err := wkspace.Dependencies(repoName, installations)
	if err != nil {
		return err
	}

	repoRoot, err := utils.RepoRoot()
	if err != nil {
		return err
	}

	for _, installation := range sorted {
		name := installation.Repository.Name
		if name != repoName && repoName != "" {
			continue
		}

		execution, err := executor.GetExecution(filepath.Join(repoRoot, name), "deploy")
		if err != nil {
			return err
		}

		if err := execution.Execute(); err != nil {
			return err
		}
		fmt.Printf("\n")
	}
	return nil
}

func bounce(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	repoRoot, err := utils.RepoRoot()
	if err != nil {
		return err
	}

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

		os.Chdir(filepath.Join(repoRoot, repoName))
		if err := workspace.Bounce(); err != nil {
			return err
		}
	}
	return nil
}

func destroy(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	dir, _ := os.Getwd()

	sorted, err := wkspace.Dependencies(repoName, installations)
	if err != nil {
		return err
	}

	for i := len(sorted) - 1; i >= 0; i-- {
		installation := sorted[i]
		if installation.Repository.Name != repoName && repoName != "" {
			continue
		}
		os.Chdir(dir)
		utils.Warn("Destroying workspace %s\n", installation.Repository.Name)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}

		if err := workspace.DestroyHelm(); err != nil {
			return err
		}

		if err := workspace.DestroyTerraform(); err != nil {
			return err
		}
	}

	utils.Success("Finished destroying workspace")
	return nil
}
