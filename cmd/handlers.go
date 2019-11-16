package main

import (
	"bufio"
	"fmt"
	"github.com/fatih/color"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/urfave/cli"
	"golang.org/x/crypto/ssh/terminal"
	"os"
	"strings"
	"syscall"
)

func Build(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	for _, installation := range installations {
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

func Deploy(c *cli.Context) error {
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

func Login(c *cli.Context) error {
	client := api.NewClient()
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Enter your email: ")
	email, _ := reader.ReadString('\n')
	fmt.Print("Enter Password: ")
	pwd, err := terminal.ReadPassword(int(syscall.Stdin))
	result, err := client.Login(strings.TrimSpace(email), strings.TrimSpace(string(pwd)))
	if err != nil {
		return err
	}
	fmt.Printf("\nlogged in as %s", email)
	config.Amend("token", result)
	return nil
}
