package main

import (
	"fmt"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/urfave/cli"
	"io/ioutil"
	"path/filepath"
)

func pushCommands() []cli.Command {
	return []cli.Command{
		{
			Name:   "terraform",
			Usage:  "pushes a terraform module",
			ArgsUsage: "path/to/module REPO",
			Action: handleTerraformUpload,
		},
		{
			Name:   "helm",
			Usage:  "pushes a helm chart",
			ArgsUsage: "path/to/chart REPO",
			Action: handleHelmUpload,
		},
		{
			Name:   "recipe",
			Usage:  "pushes a recipe",
			ArgsUsage: "path/to/recipe.yaml REPO",
			Action: handleRecipeUpload,
		},
	}
}

func handleTerraformUpload(c *cli.Context) error {
	client := api.NewUploadClient()
	_, err := client.UploadTerraform(c.Args().Get(0), c.Args().Get(1))
	return err
}

func handleHelmUpload(c *cli.Context) error {
	conf := config.Read()
	pth, repo := c.Args().Get(0), c.Args().Get(1)

	if err := utils.Cmd(&conf, "helm", "repo", "add", repo, fmt.Sprintf("cm://mart.piazzaapp.com/cm/%s", repo));
			err != nil {
		return err
	}
	return utils.Cmd(&conf, "helm", "push", "--context-path=/cm", pth, repo)
}

func handleRecipeUpload(c *cli.Context) error {
	client := api.NewClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	recipeInput, err := api.ConstructRecipe(contents)
	if err != nil {
		return err
	}

	_, err = client.CreateRecipe(c.Args().Get(1), recipeInput)
	return err
}