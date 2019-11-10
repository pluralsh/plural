package api

import (
	"fmt"
	"github.com/machinebox/graphql"
)

type instResponse struct {
	Installations struct {
		Edges []InstallationEdge
	}
}

var instQuery = fmt.Sprintf(`
	query {
		installations(first: %d) {
			edges {
				node {
					...InstallationFragment
				}
			}
		}
	}
	%s
`, pageSize, InstallationFragment)

func (client *Client) GetInstallations() ([]InstallationEdge, error) {
	var resp instResponse
	err := client.Run(graphql.NewRequest(instQuery), &resp)
	return resp.Installations.Edges, err
}