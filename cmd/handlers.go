package main

import (
	"fmt"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/wkspace"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/urfave/cli"
	"os"
	"io/ioutil"
	"bytes"
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
		if installation.Repository.Name != repoName {
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

	encryptConfig := [][]string{
		{"filter.chartmart-crypt.smudge", "chartmart crypto decrypt"},
		{"filter.chartmart-crypt.clean", "chartmart crypto encrypt"},
		{"filter.chartmart-crypt.required", "true"},
		{"diff.chartmart-crypt.textconv", "chartmart crypto decrypt"},
	}

	utils.Highlight("Creating git encryption filters\n\n")
	for _, conf := range encryptConfig {
		if err := gitConfig(conf[0], conf[1]); err != nil {
			panic(err)
		}
	}

	utils.WriteFileIfNotPresent(".gitattributes", gitattributes)
	utils.WriteFileIfNotPresent(".gitignore", gitignore)

	utils.Success("Workspace is properly configured!")
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
		tmpl, err := utils.MakeTemplate(string(testTemplate))
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