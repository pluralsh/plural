package wkspace

import (
	"fmt"
	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/manifest"
	toposort "github.com/philopon/go-toposort"
)

func TopSort(installations []api.Installation) ([]api.Installation, error) {
	var repoMap = make(map[string]api.Installation)
	graph := toposort.NewGraph(len(installations))
	for _, installation := range installations {
		repo := installation.Repository.Name
		repoMap[repo] = installation
		graph.AddNode(repo)
		path := manifestPath(&installation.Repository)
		man, err := manifest.Read(path)
		if err != nil {
			return nil, err
		}

		for _, dep := range man.Dependencies {
			if _, ok := repoMap[dep.Repo]; !ok {
				graph.AddNode(dep.Repo)
			}
			graph.AddEdge(repo, dep.Repo)
		}
	}

	result, ok := graph.Toposort()
	var sorted = make([]api.Installation, len(result))
	if !ok {
		return sorted, fmt.Errorf("Cycle detected in dependency graph")
	}

	for j := 1; j <= len(result); j++ {
		sorted[len(result)-j] = repoMap[result[j-1]]
	}
	return sorted, nil
}

func Dependencies(repo string, installations []api.Installation) ([]api.Installation, error) {
	topsorted, err := TopSort(installations)
	if err != nil {
		return topsorted, err
	}

	ind := 0
	for i := 0; i < len(topsorted); i++ {
		ind = i
		if topsorted[i].Repository.Name == repo {
			break
		}
	}

	return topsorted[:(ind + 1)], err
}
