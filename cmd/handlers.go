package main

import (
  "fmt"
	"github.com/urfave/cli"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/michaeljguarino/chartmart/api"
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