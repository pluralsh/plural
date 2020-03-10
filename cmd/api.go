package main

import (
	"github.com/michaeljguarino/forge/api"
	"github.com/olekukonko/tablewriter"
	"github.com/urfave/cli"
	"os"
)

func apiCommands() []cli.Command {
	return []cli.Command{
		{
			Name:  "list",
			Usage: "lists forge resources",
			Subcommands: []cli.Command{
				{
					Name:      "installations",
					Usage:     "lists your installations",
					ArgsUsage: "",
					Action:    handleInstallations,
				},
				{
					Name:      "charts",
					Usage:     "lists charts for a repository",
					ArgsUsage: "REPO_ID",
					Action:    handleCharts,
				},
				{
					Name:      "terraform",
					Usage:     "lists terraform modules for a repository",
					ArgsUsage: "REPO_ID",
					Action:    handleTerraforma,
				},
				{
					Name:      "versions",
					Usage:     "lists versions of a chart",
					ArgsUsage: "CHART_ID",
					Action:    handleVersions,
				},
				{
					Name:      "chartinstallations",
					Aliases:   []string{"ci"},
					Usage:     "lists chart installations for a repository",
					ArgsUsage: "REPO_ID",
					Action:    handleChartInstallations,
				},
				{
					Name:      "terraforminstallations",
					Aliases:   []string{"ti"},
					Usage:     "lists terraform installations for a repository",
					ArgsUsage: "REPO_ID",
					Action:    handleTerraformInstallations,
				},
				{
					Name:      "artifacts",
					Usage:     "Lists artifacts for a repository",
					ArgsUsage: "REPO_ID",
					Action:    handleArtifacts,
				},
			},
		},
	}
}

func handleInstallations(c *cli.Context) error {
	client := api.NewClient()
	installations, err := client.GetInstallations()
	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Repository", "Repository Id", "Publisher"})
	for _, inst := range installations {
		repo := inst.Repository
		table.Append([]string{repo.Name, repo.Id, repo.Publisher.Name})
	}
	table.Render()
	return nil
}

func handleCharts(c *cli.Context) error {
	client := api.NewClient()
	charts, err := client.GetCharts(c.Args().First())
	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Name", "Description", "Latest Version"})
	for _, chart := range charts {
		table.Append([]string{chart.Id, chart.Name, chart.Description, chart.LatestVersion})
	}
	table.Render()
	return nil
}

func handleTerraforma(c *cli.Context) error {
	client := api.NewClient()
	tfs, err := client.GetTerraforma(c.Args().First())
	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Name", "Description"})
	for _, tf := range tfs {
		table.Append([]string{tf.Id, tf.Name, tf.Description})
	}
	table.Render()
	return nil
}

func handleVersions(c *cli.Context) error {
	client := api.NewClient()
	versions, err := client.GetVersions(c.Args().First())

	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Version"})
	for _, version := range versions {
		table.Append([]string{version.Id, version.Version})
	}
	table.Render()
	return nil
}

func handleChartInstallations(c *cli.Context) error {
	client := api.NewClient()
	chartInstallations, err := client.GetChartInstallations(c.Args().First())

	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Chart Id", "Chart Name", "Version"})
	for _, ci := range chartInstallations {
		table.Append([]string{ci.Id, ci.Chart.Id, ci.Chart.Name, ci.Version.Version})
	}
	table.Render()
	return nil
}

func handleTerraformInstallations(c *cli.Context) error {
	client := api.NewClient()
	terraformInstallations, err := client.GetTerraformInstallations(c.Args().First())

	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Terraform Id", "Name"})
	for _, ti := range terraformInstallations {
		tf := ti.Terraform
		table.Append([]string{ti.Id, tf.Id, tf.Name})
	}
	table.Render()
	return nil
}

func handleArtifacts(c *cli.Context) error {
	client := api.NewClient()
	artifacts, err := client.ListArtifacts(c.Args().First())

	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Id", "Name", "Platform", "Blob", "Sha"})
	for _, artifact := range artifacts {
		table.Append([]string{artifact.Id, artifact.Name, artifact.Platform, artifact.Blob, artifact.Sha})
	}
	table.Render()
	return nil
}
