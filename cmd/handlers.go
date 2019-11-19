package main

import (
	"fmt"
	"github.com/fatih/color"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/urfave/cli"
	"os"
)

const gitattributes = `/**/helm/**/values.yaml filter=chartmart-crypt diff=chartmart-crypt
/**/manifest.yaml filter=chartmart-crypt diff=chartmart-crypt
`

const gitignore = `/**/.terraform
/**/.terraform*
/**/terraform.tfstate*
`

func build(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	for _, installation := range installations {
		if c.IsSet("only") && c.String("only") != installation.Repository.Name {
			continue
		}

		repoName := installation.Repository.Name
		color.New(color.FgYellow, color.Bold).Printf("Building workspace for %s\n", repoName)
		workspace, err := wkspace.New(client, &installation)
		if err != nil {
			return err
		}
		if err := workspace.Prepare(); err != nil {
			return err
		}
		color.New(color.FgGreen, color.Bold).Printf("Finished building %s\n", repoName)
	}
	return nil
}

func deploy(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	dir, _ := os.Getwd()
	for _, installation := range installations {
		if installation.Repository.Name != repoName {
			continue
		}

		color.New(color.FgYellow, color.Bold).Printf("(Re)building workspace for %s\n", installation.Repository.Name)
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

		color.New(color.FgYellow, color.Bold).Printf("bouncing deployments in %s\n", installation.Repository.Name)
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

func handleInit(c *cli.Context) error {
	client := api.NewClient()
	email, _ := utils.ReadLine("Enter your email: ")
	pwd, _ := utils.ReadPwd("Enter password: ")
	result, err := client.Login(email, pwd)
	if err != nil {
		return err
	}

	fmt.Printf("\nlogged in as %s\n", email)
	config.Amend("token", result)

	encryptConfig := [][]string{
		{"filter.chartmart-crypt.smudge", "chartmart crypto decrypt"},
		{"filter.chartmart-crypt.clean", "chartmart crypto encrypt"},
		{"filter.chartmart-crypt.required", "true"},
		{"diff.chartmart-crypt.textconv", "chartmart crypto decrypt"},
	}

	color.New(color.Bold).Printf("Creating git encryption filters\n\n")
	for _, conf := range encryptConfig {
		if err := gitConfig(conf[0], conf[1]); err != nil {
			panic(err)
		}
	}

	utils.WriteFileIfNotPresent(".gitattributes", gitattributes)
	utils.WriteFileIfNotPresent(".gitignore", gitignore)

	color.New(color.FgGreen, color.Bold).Printf("Workspace is properly configured!")
	return nil
}
