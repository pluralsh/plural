package api

import (
	"os"
	"github.com/urfave/cli"
	"github.com/olekukonko/tablewriter"
)


func handleInstallations(c *cli.Context) error {
	client := NewClient()
	installations, err := client.GetInstallations()
	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Repository", "Repository Id", "Publisher"})
	for _, edge := range installations {
		repo := edge.Node.Repository
		table.Append([]string{ repo.Name, repo.Id, repo.Publisher.Name })
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
	for _, edge := range charts {
		chart := edge.Node
		table.Append([]string{ chart.Id, chart.Name, chart.Description, chart.LatestVersion })
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
	for _, edge := range tfs {
		tf := edge.Node
		table.Append([]string{ tf.Id, tf.Name, tf.Description })
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
	for _, edge := range versions {
		version := edge.Node
		table.Append([]string{ version.Id, version.Version })
	}
	table.Render()
	return nil
}