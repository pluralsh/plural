package api

import (
	"os"
	"github.com/urfave/cli"
	"github.com/olekukonko/tablewriter"
)


func HandleInstallations(c *cli.Context) error {
	client := NewClient()
	installations, err := client.GetInstallations()
	if err != nil {
		return err
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Repo Name"})
	for _, inst := range installations {
		table.Append([]string{ inst.Node.Repository.Name })
	}
	table.Render()
	return nil
}