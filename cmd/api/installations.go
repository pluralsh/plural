package api

import (
	"fmt"
	"github.com/machinebox/graphql"
)

type response struct {
	Installations struct {
		Edges []InstallationEdge
	}
}

var instQuery = fmt.Sprintf(`
	query {
		installations(first: 15) {
			edges {
				node {
					...InstallationFragment
				}
			}
		}
	}
	%s
	%s
`, InstallationFragment, RepositoryFragment)

func (client *Client) GetInstallations() ([]InstallationEdge, error) {
	var resp response
	err := client.Run(graphql.NewRequest(instQuery), &resp)
	return resp.Installations.Edges, err
}