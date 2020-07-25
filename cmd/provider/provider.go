package provider

import (
	"fmt"
	"github.com/michaeljguarino/forge/manifest"
	"github.com/michaeljguarino/forge/utils"
	"strconv"
	"strings"
)

type Provider interface {
	Name() string
	Cluster() string
	Project() string
	Region() string
	Bucket() string
	KubeConfig() error
	CreateBackend(prefix string) (string, error)
}

func Select() (Provider, error) {
	available := []string{GCP, AWS}
	path := manifest.ProjectManifestPath()
	if utils.Exists(path) {
		if project, err := manifest.ReadProject(path); err == nil {
			line := fmt.Sprintf("Reuse existing manifest {provider: %s, cluster: %s, bucket: %s} [(y)/n]:",
				project.Provider, project.Cluster, project.Bucket)
			val, _ := utils.ReadLine(line)

			if val != "n" {
				return FromManifest(&manifest.Manifest{
					Cluster:  project.Cluster,
					Project:  project.Project,
					Bucket:   project.Bucket,
					Provider: project.Provider,
				})
			}
		}
	}

	fmt.Println("Select on of the following providers:")
	for i, name := range available {
		fmt.Printf("[%d] %s\n", i, name)
	}
	fmt.Println("")

	val, _ := utils.ReadLine("Your choice: ")
	i, err := strconv.Atoi(strings.TrimSpace(val))
	if err != nil {
		return nil, err
	}
	if i >= len(available) {
		return nil, fmt.Errorf("Invalid index, must be < %d", len(available))
	}
	utils.Success("Using provider %s\n", available[i])
	return New(available[i])
}

func FromManifest(man *manifest.Manifest) (Provider, error) {
	switch man.Provider {
	case GCP:
		return gcpFromManifest(man)
	case AWS:
		return awsFromManifest(man)
	default:
		return nil, fmt.Errorf("Invalid provider name: %s", man.Provider)
	}
}

func New(provider string) (Provider, error) {
	switch provider {
	case GCP:
		return mkGCP()
	case AWS:
		return mkAWS()
	default:
		return nil, fmt.Errorf("Invalid provider name: %s", provider)
	}
}
