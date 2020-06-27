package main

import (
	"fmt"
	"io/ioutil"
	"os/exec"
	"path/filepath"

	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/config"
	"github.com/michaeljguarino/forge/crypto"
	"github.com/michaeljguarino/forge/utils"
	"github.com/urfave/cli"
)

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

	utils.Success("Workspace properly imported\n")
	return nil
}

func initHelm(success string) error {
	err := exec.Command("helm", "init", "--client-only").Run()
	if err != nil {
		return err
	}
	utils.Success(success)
	return nil
}
