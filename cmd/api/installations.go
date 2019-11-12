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

func (client *Client) GetInstallations() ([]Installation, error) {
	var resp instResponse
	err := client.Run(graphql.NewRequest(instQuery), &resp)
	insts := make([]Installation, len(resp.Installations.Edges))
	for i, edge := range resp.Installations.Edges {
		insts[i] = edge.Node
	}
	return insts, err
}