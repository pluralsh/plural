package wkspace

import (
	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/manifest"
)

func (wk *Workspace) BuildManifest() *manifest.Manifest {
	repository := wk.Installation.Repository
	charts := make([]manifest.ChartManifest, len(wk.Charts))
	terraform := make([]manifest.TerraformManifest, len(wk.Terraform))

	for i, ci := range wk.Charts {
		charts[i] = *buildChartManifest(&ci)
	}
	for i, ti := range wk.Terraform {
		terraform[i] = *buildTerraformManifest(&ti)
	}
	return &manifest.Manifest{
		repository.Id,
		repository.Name,
		wk.Provider.Cluster(),
		wk.Provider.Project(),
		wk.Provider.Bucket(),
		wk.Provider.Name(),
		wk.Provider.Region(),
		wk.Installation.License,
		charts,
		terraform,
		buildDependencies(repository.Name, wk.Charts, wk.Terraform),
	}
}

func buildDependencies(repo string, charts []api.ChartInstallation, tfs []api.TerraformInstallation) []manifest.Dependency {
	var deps []manifest.Dependency
	var seen = make(map[string]bool)

	for _, chart := range charts {
		for _, dep := range chart.Chart.Dependencies.Dependencies {
			_, ok := seen[dep.Repo]
			if ok {
				continue
			}

			if dep.Repo != repo {
				deps = append(deps, manifest.Dependency{dep.Repo})
				seen[dep.Repo] = true
			}
		}
	}

	for _, tf := range tfs {
		for _, dep := range tf.Terraform.Dependencies.Dependencies {
			_, ok := seen[dep.Repo]
			if ok {
				continue
			}

			if dep.Repo != repo {
				deps = append(deps, manifest.Dependency{dep.Repo})
				seen[dep.Repo] = true
			}
		}
	}

	return deps
}

func buildChartManifest(chartInstallation *api.ChartInstallation) *manifest.ChartManifest {
	chart := chartInstallation.Chart
	version := chartInstallation.Version
	return &manifest.ChartManifest{chart.Id, chart.Name, version.Id, version.Version}
}

func buildTerraformManifest(tfInstallation *api.TerraformInstallation) *manifest.TerraformManifest {
	terraform := tfInstallation.Terraform
	return &manifest.TerraformManifest{terraform.Id, terraform.Name}
}
