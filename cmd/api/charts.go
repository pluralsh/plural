package api

import (
	"fmt"
	"github.com/machinebox/graphql"
)

type chartsResponse struct {
	Charts struct {
		Edges []ChartEdge
	}
}

type versionsResponse struct {
	Versions struct {
		Edges []VersionEdge
	}
}

type chartInstallationsResponse struct {
	ChartInstallations struct {
		Edges []ChartInstallationEdge
	}
}

var chartsQuery = fmt.Sprintf(`
	query ChartsQuery($id: ID!) {
		charts(repositoryId: $id, first: %d) {
			edges {
				node {
					...ChartFragment
				}
			}
		}
	}
	%s
`, pageSize, ChartFragment)

var versionsQuery = fmt.Sprintf(`
	query VersionsQuery($id: ID!) {
		versions(chartId: $id, first: %d) {
			edges {
				node {
					...VersionFragment
				}
			}
		}
	}
	%s
`, pageSize, VersionFragment)

var chartInstallationsQuery = fmt.Sprintf(`
	query CIQuery($id: ID!) {
		chartInstallations(repositoryId: $id, first: %d) {
			edges {
				node {
					...ChartInstallationFragment
				}
			}
		}
	}
	%s
`, pageSize, ChartInstallationFragment)

func (client *Client) GetCharts(repoId string) ([]Chart, error) {
	var resp chartsResponse
	req := graphql.NewRequest(chartsQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	charts := make([]Chart, len(resp.Charts.Edges))
	for i, edge := range resp.Charts.Edges {
		charts[i] = edge.Node
	}
	return charts, err
}

func (client *Client) GetVersions(chartId string) ([]Version, error) {
	var resp versionsResponse
	req := graphql.NewRequest(versionsQuery)
	req.Var("id", chartId)
	err := client.Run(req, &resp)
	versions := make([]Version, len(resp.Versions.Edges))
	for i, edge := range resp.Versions.Edges {
		versions[i] = edge.Node
	}
	return versions, err
}

func (client *Client) GetChartInstallations(repoId string) ([]ChartInstallation, error) {
	var resp chartInstallationsResponse
	req := graphql.NewRequest(chartInstallationsQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	insts := make([]ChartInstallation, len(resp.ChartInstallations.Edges))
	for i, edge := range resp.ChartInstallations.Edges {
		insts[i] = edge.Node
	}
	return insts, err
}