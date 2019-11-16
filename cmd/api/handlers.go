package api

import (
	"github.com/olekukonko/tablewriter"
	"github.com/urfave/cli"
	"os"
)

func handleInstallations(c *cli.Context) error {
	client := NewClient()
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
	client := NewClient()
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
	client := NewClient()
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
	client := NewClient()
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
	client := NewClient()
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
	client := NewClient()
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
