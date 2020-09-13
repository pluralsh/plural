package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/config"
	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/forgefile"
	"github.com/michaeljguarino/forge/template"
	"github.com/michaeljguarino/forge/utils"
	"github.com/urfave/cli"
)

func pushCommands() []cli.Command {
	return []cli.Command{
		{
			Name:      "terraform",
			Usage:     "pushes a terraform module",
			ArgsUsage: "path/to/module REPO",
			Action:    handleTerraformUpload,
		},
		{
			Name:      "helm",
			Usage:     "pushes a helm chart",
			ArgsUsage: "path/to/chart REPO",
			Action:    handleHelmUpload,
		},
		{
			Name:      "recipe",
			Usage:     "pushes a recipe",
			ArgsUsage: "path/to/recipe.yaml REPO",
			Action:    handleRecipeUpload,
		},
		{
			Name:      "resourcedefinition",
			Usage:     "pushes a resource definition for the repo",
			ArgsUsage: "path/to/def.yaml REPO",
			Action:    handleResourceDefinition,
		},
		{
			Name:      "integration",
			Usage:     "pushes an integration for the repo",
			ArgsUsage: "path/to/def.yaml REPO",
			Action:    handleIntegration,
		},
		{
			Name:      "artifact",
			Usage:     "creates an artifact for the repo",
			ArgsUsage: "path/to/def.yaml REPO",
			Action:    handleArtifact,
		},
		{
			Name:      "dashboard",
			Usage:     "creates dashboards for a repository",
			ArgsUsage: "path/to/def.yaml REPO",
			Action:    handleDashboard,
		},
		{
			Name:      "database",
			Usage:     "registers a new database for a repository",
			ArgsUsage: "path/to/def.yaml REPO",
			Action:    handleDatabase,
		},
		{
			Name:      "shell",
			Usage:     "registers a new shell for a repository",
			ArgsUsage: "path/to/def.yaml REPO",
			Action:    createShell,
		},
		{
			Name:      "crd",
			Usage:     "registers a new crd for a chart",
			ArgsUsage: "path/to/def.yaml REPO CHART",
			Action:    createCrd,
		},
	}
}

func apply(c *cli.Context) error {
	path, _ := os.Getwd()
	var file = filepath.Join(path, "Forgefile")
	if c.IsSet("file") {
		file, _ = filepath.Abs(c.String("file"))
	}

	if err := os.Chdir(filepath.Dir(file)); err != nil {
		return err
	}

	forge, err := forgefile.Parse(file)
	if err != nil {
		return err
	}
	lock := forgefile.Lock(file)
	return forge.Execute(file, lock)
}

func handleTerraformUpload(c *cli.Context) error {
	client := api.NewUploadClient()
	_, err := client.UploadTerraform(c.Args().Get(0), c.Args().Get(1))
	return err
}

func handleHelmUpload(c *cli.Context) error {
	conf := config.Read()
	pth, repo := c.Args().Get(0), c.Args().Get(1)

	f, err := tmpValuesFile(pth)
	if err != nil {
		return err
	}
	defer os.Remove(f.Name())

	utils.Highlight("linting helm: ")
	cmd, output := executor.SuppressedCommand("helm", "lint", pth, "-f", f.Name())

	err = executor.RunCommand(cmd, output)
	if err != nil {
		return err
	}

	if err := utils.Cmd(&conf, "helm", "repo", "add", repo, fmt.Sprintf("cm://forge.piazza.app/cm/%s", repo)); err != nil {
		return err
	}
	return utils.Cmd(&conf, "helm", "push", "--context-path=/cm", pth, repo)
}

func tmpValuesFile(path string) (f *os.File, err error) {
	valuesTmpl, err := utils.ReadFile(filepath.Join(path, "values.yaml.gotpl"))
	if err != nil {
		return
	}
	tmpl, err := template.MakeTemplate(valuesTmpl)
	if err != nil {
		return
	}

	vals := map[string]interface{}{
		"Values":  map[string]interface{}{},
		"License": "example-license",
	}

	var buf bytes.Buffer

	if err = tmpl.Execute(&buf, vals); err != nil {
		return
	}

	f, err = ioutil.TempFile("", "values.yaml")
	if err != nil {
		return
	}

	_, err = f.Write(buf.Bytes())
	if err != nil {
		return
	}
	err = f.Close()
	return
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

func handleResourceDefinition(c *cli.Context) error {
	client := api.NewClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	input, err := api.ConstructResourceDefinition(contents)
	if err != nil {
		return err
	}
	_, err = client.CreateResourceDefinition(c.Args().Get(1), input)
	return err
}

func handleIntegration(c *cli.Context) error {
	client := api.NewClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	input, err := api.ConstructIntegration(contents)
	if err != nil {
		return err
	}

	_, err = client.CreateIntegration(c.Args().Get(1), input)
	return err
}

func createShell(c *cli.Context) error {
	client := api.NewClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	input, err := api.ConstructShellInput(contents)
	if err != nil {
		return err
	}

	_, err = client.CreateShell(c.Args().Get(1), input)
	return err
}

func handleDatabase(c *cli.Context) error {
	client := api.NewClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	input, err := api.ConstructDatabaseInput(contents)
	if err != nil {
		return err
	}

	_, err = client.CreateDatabase(c.Args().Get(1), input)
	return err
}

func handleArtifact(c *cli.Context) error {
	client := api.NewUploadClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	input, err := api.ConstructArtifactAttributes(contents)
	if err != nil {
		return err
	}

	_, err = client.CreateArtifact(c.Args().Get(1), input)
	return err
}

func handleDashboard(c *cli.Context) error {
	client := api.NewClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	contents, err := ioutil.ReadFile(fullPath)
	if err != nil {
		return err
	}

	input, err := api.ConstructRepositoryInput(contents)
	if err != nil {
		return err
	}

	_, err = client.UpdateRepository(c.Args().Get(1), input)
	return err
}

func createCrd(c *cli.Context) error {
	client := api.NewUploadClient()
	fullPath, _ := filepath.Abs(c.Args().Get(0))
	repo := c.Args().Get(1)
	chart := c.Args().Get(2)
	return client.CreateCrd(repo, chart, fullPath)
}