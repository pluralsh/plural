package utils

import (
	"fmt"

	toposort "github.com/philopon/go-toposort"
)

type SafeGraph struct {
	Graph   *toposort.Graph
	Present map[string]bool
}

func Graph(size int) *SafeGraph {
	return &SafeGraph{Graph: toposort.NewGraph(size), Present: make(map[string]bool)}
}

func (g *SafeGraph) AddNode(name string) bool {
	return g.Graph.AddNode(name)
}

func (g *SafeGraph) AddEdge(in, out string) bool {
	key := fmt.Sprintf("%s:%s", in, out)
	if _, ok := g.Present[key]; ok {
		return false
	}
	g.Present[key] = true
	return g.Graph.AddEdge(in, out)
}

func (g *SafeGraph) Topsort() ([]string, bool) {
	return g.Graph.Toposort()
}
