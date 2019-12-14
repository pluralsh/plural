package main

import (
	"fmt"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/crypto"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/michaeljguarino/chartmart/template"
	"github.com/urfave/cli"
	"path/filepath"
	"os"
	"io/ioutil"
	"bytes"
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

func topsort(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	sorted, err := wkspace.Dependencies(repoName, installations)
	if err != nil {
		return err
	}

	for _, inst := range sorted {
		fmt.Println(inst.Repository.Name)
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

func handleInit(c *cli.Context) error {
	conf := config.Read()
	conf.Token = ""
	client := api.FromConfig(&conf)
	email, _ := utils.ReadLine("Enter your email: ")
	pwd, _ := utils.ReadPwd("Enter password: ")
	result, err := client.Login(email, pwd)
	if err != nil {
		return err
	}

	fmt.Printf("\nlogged in as %s\n", email)
	conf.Email = email
	conf.Token = result

	client = api.FromConfig(&conf)
	accessToken, err := client.GrabAccessToken()
	if err != nil {
		return err
	}
	conf.Token = accessToken
	config.Flush(&conf)

	if err := cryptoInit(c); err != nil {
		return err
	}

	utils.Success("Workspace is properly configured!\n")
	return nil
}

func handleImport(c *cli.Context) error {
	dir, err := filepath.Abs(c.Args().Get(0))
	if err != nil {
		return err
	}

	conf := config.Import(filepath.Join(dir, "config.yml"))
	config.Flush(&conf)

	if err := cryptoInit(c); err != nil {
		return err
	}

	data, err := ioutil.ReadFile(filepath.Join(dir, "key"))
	if err != nil {
		return err
	}

	key, err := crypto.Import(data)
	if err != nil {
		return err
	}
	if err := key.Flush(); err != nil {
		return err
	}

	utils.Success("Workspace properly imported")
	return nil
}

func testTemplate(c *cli.Context) error {
	client := api.NewClient()
	installations, _ := client.GetInstallations()
	repoName := c.Args().Get(0)
	testTemplate, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		return err
	}

	for _, installation := range installations {
		if installation.Repository.Name != repoName {
			continue
		}

		ctx := installation.Context
		tmpl, err := template.MakeTemplate(string(testTemplate))
		if err != nil {
			return err
		}
		var buf bytes.Buffer
		buf.Grow(5 * 1024)
		vals := map[string]interface{}{"Values": ctx, "License": installation.License}
		if err := tmpl.Execute(&buf, vals); err != nil {
			return err
		}

		os.Stdout.Write(buf.Bytes())
	}

	return nil
}