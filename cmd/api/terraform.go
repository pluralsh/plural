package api

import (
	"fmt"
	"github.com/michaeljguarino/forge/utils"
	"os"
	"path"
	"path/filepath"
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

var terraformUpload = fmt.Sprintf(`
	mutation TerraformUpload($repoName: String!, $name: String!, $package: UploadOrUrl!) {
		uploadTerraform(repositoryName: $repoName, name: $name, attributes: {name: $name, package: $package}) {
			...TerraformFragment
		}
	}
	%s
`, TerraformFragment)

func (client *Client) GetTerraforma(repoId string) ([]Terraform, error) {
	var resp terraformResponse
	req := client.Build(terraformQuery)
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
	req := client.Build(terraformInstallationQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	inst := make([]TerraformInstallation, len(resp.TerraformInstallations.Edges))
	for i, edge := range resp.TerraformInstallations.Edges {
		inst[i] = edge.Node
	}
	return inst, err
}

func (client *Client) UploadTerraform(dir, repoName string) (Terraform, error) {
	name := path.Base(dir)
	fullPath, err := filepath.Abs(dir)
	var tf Terraform
	if err != nil {
		return tf, err
	}
	cwd, _ := os.Getwd()
	tarFile := filepath.Join(cwd, name+".tgz")
	f, err := os.Create(tarFile)
	if err != nil {
		return tf, err
	}
	defer f.Close()

	if err := utils.Tar(fullPath, f, "\\.terraform"); err != nil {
		return tf, err
	}
	rf, err := os.Open(tarFile)
	if err != nil {
		return tf, err
	}
	defer rf.Close()
	defer os.Remove(tarFile)

	req := client.Build(terraformUpload)
	req.Var("repoName", repoName)
	req.Var("name", name)
	req.Var("package", "package")
	req.File("package", tarFile, rf)
	err = client.Run(req, &tf)
	return tf, err
}
