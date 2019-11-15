package main

import (
	"bufio"
	"syscall"
	"golang.org/x/crypto/ssh/terminal"
	"strings"
	"os"
  "fmt"
	"github.com/urfave/cli"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
)

func Build(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	for _, installation := range installations {
		fmt.Printf("Building workspace for %s\n", installation.Repository.Name)
		workspace, _ := wkspace.New(client, &installation)
		if err := workspace.Prepare(); err != nil {
			return err
		}
	}
	return nil
}

func Deploy(c *cli.Context) error {
	fmt.Println("placeholder for deploy")
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