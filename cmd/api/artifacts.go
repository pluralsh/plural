package api

import (
	"os"
	"fmt"
	"path/filepath"
	"gopkg.in/yaml.v2"
	"github.com/michaeljguarino/forge/utils"
)

var createArtifact = fmt.Sprintf(`
	mutation CreateArtifact($repoName: String!, $name: String!, $readme: String!, $type: String!, $platform: String!, $blob: UploadOrUrl!) {
		createArtifact(repositoryName: $repoName, attributes: {
			name: $name,
			blob: $blob,
			readme: $readme,
			type: $type,
			platform: $platform
		}) {
			...ArtifactFragment
		}
	}
	%s
`, ArtifactFragment)

type ArtifactAttributes struct {
	Name string
	Readme string
	Type string
	Platform string
	Blob string
}

type artifactsResponse struct {
	Repository struct {
		Artifacts []Artifact
	}
}

var artifactsQuery = fmt.Sprintf(`
	query ArtifactsQuery($id: ID!) {
		repository(id: $id) {
			artifacts {
				...ArtifactFragment
			}
		}
	}
	%s
`, ArtifactFragment)

func (client *Client) ListArtifacts(repo string) ([]Artifact, error) {
	var resp artifactsResponse
	req := client.Build(artifactsQuery)
	req.Var("id", repo)
	err := client.Run(req, &resp)
	if err != nil {
		return resp.Repository.Artifacts, err
	}
	return resp.Repository.Artifacts, nil
}

func (client *Client) CreateArtifact(repo string, attrs ArtifactAttributes) (Artifact, error) {
	var artifact Artifact
	fullPath, _ := filepath.Abs(attrs.Blob)
	rf, err := os.Open(fullPath)
	if err != nil {
		return artifact, err
	}
	defer rf.Close()

	readmePath, _ := filepath.Abs(attrs.Readme)
	readme, err := utils.ReadFile(readmePath)
	if err != nil {
		return artifact, err
	}

	req := client.Build(createArtifact)
	req.Var("repoName", repo)
	req.Var("name", attrs.Name)
	req.Var("readme", readme)
	req.Var("type", attrs.Type)
	req.Var("platform", attrs.Platform)
	req.Var("blob", "blob")
	req.File("blob", attrs.Blob, rf)
	err = client.Run(req, &artifact)
	return artifact, err
}

func ConstructArtifactAttributes(marshalled []byte) (ArtifactAttributes, error) {
	var attrs ArtifactAttributes
	err := yaml.Unmarshal(marshalled, &attrs)
	return attrs, err
}