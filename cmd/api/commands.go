package api

import (
  "github.com/urfave/cli"
)

func Commands() []cli.Command {
	return []cli.Command{
		{
			Name:  "list",
			Usage: "lists chartmart resources",
      Subcommands: []cli.Command{
				{
					Name: "installations",
					Usage: "lists your installations",
					ArgsUsage: "",
					Action: handleInstallations,
				},
				{
					Name: "charts",
					Usage: "lists charts for a repository",
					ArgsUsage: "REPO_ID",
					Action: handleCharts,
				},
				{
					Name: "terraform",
					Usage: "lists terraform modules for a repository",
					ArgsUsage: "REPO_ID",
					Action: handleTerraforma,
				},
				{
					Name: "versions",
					Usage: "lists versions of a chart",
					ArgsUsage: "CHART_ID",
					Action: handleVersions,
				},
				{
					Name: "chartinstallations",
					Aliases: []string{"ci"},
					Usage: "lists chart installations for a repository",
					ArgsUsage: "REPO_ID",
					Action: handleChartInstallations,
				},
				{
					Name: "terraforminstallations",
					Aliases: []string{"ti"},
					Usage: "lists terraform installations for a repository",
					ArgsUsage: "REPO_ID",
					Action: handleTerraformInstallations,
				},
			},
		},
		{
			Name: "upload",
			Usage: "uploads charts/repositories",
			Subcommands: []cli.Command{
				{
					Name: "terraform",
					Usage: "upload a terraform module",
					ArgsUsage: "REPO_ID DIR",
					Action: handleTerraformUpload,
				},
			},
		},
	}
}