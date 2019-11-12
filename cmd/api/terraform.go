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

type terraformInstallationResponse struct {
	TerraformInstallations struct {
		Edges []TerraformInstallationEdge
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

var terraformInstallationQuery = fmt.Sprintf(`
	query TerraformInstallations($id: ID!) {
		terraformInstallations(repositoryId: $id, first: %d) {
			edges {
				node {
					...TerraformInstallationFragment
				}
			}
		}
	}
	%s
`, pageSize, TerraformInstallationFragment)

func (client *Client) GetTerraforma(repoId string) ([]Terraform, error) {
	var resp terraformResponse
	req := graphql.NewRequest(terraformQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	terraform := make([]Terraform, len(resp.Terraform.Edges))
	for i, edge := range resp.Terraform.Edges {
		terraform[i] = edge.Node
	}
	return terraform, err
}

func (client *Client) GetTerraformInstallations(repoId string) ([]TerraformInstallation, error) {
	var resp terraformInstallationResponse
	req := graphql.NewRequest(terraformInstallationQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	inst := make([]TerraformInstallation, len(resp.TerraformInstallations.Edges))
	for i, edge := range resp.TerraformInstallations.Edges {
		inst[i] = edge.Node
	}
	return inst, err
}