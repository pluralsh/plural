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

func (client *Client) GetCharts(repoId string) ([]ChartEdge, error) {
	var resp chartsResponse
	req := graphql.NewRequest(chartsQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	return resp.Charts.Edges, err
}

func (client *Client) GetVersions(chartId string) ([]VersionEdge, error) {
	var resp versionsResponse
	req := graphql.NewRequest(versionsQuery)
	req.Var("id", chartId)
	err := client.Run(req, &resp)
	return resp.Versions.Edges, err
}

func (client *Client) GetChartInstallations(repoId string) ([]ChartInstallationEdge, error) {
	var resp chartInstallationsResponse
	req := graphql.NewRequest(chartInstallationsQuery)
	req.Var("id", repoId)
	err := client.Run(req, &resp)
	return resp.ChartInstallations.Edges, err
}