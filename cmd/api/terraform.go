package api

import (
	"fmt"
	"github.com/machinebox/graphql"
)

type terraformResponse struct {
	Terraform struct {
		Edges []TerraformEdge
	}
}

var terraformQuery = fmt.Sprintf(`
	query terraformQuery($id: ID!) {
		terraform(repositoryId: $id, first: %d) {
			edges {
				node {
					...TerraformFragment
				}
			}
		}
	}
	%s
`, pageSize, TerraformFragment)

func (client *Client) GetTerraforma(repoId string) ([]TerraformEdge, error) {
	var resp terraformResponse
	req := graphql.NewRequest(terraformQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	return resp.Terraform.Edges, err
}