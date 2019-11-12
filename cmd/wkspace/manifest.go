package wkspace

import (
	"io/ioutil"
	"gopkg.in/yaml.v2"
	"github.com/michaeljguarino/chartmart/api"
)

type ChartManifest struct {
	Id string
	Name string
	VersionId string
	Version string
}

type TerraformManifest struct {
	Id string
	Name string
}

type Manifest struct {
	Id string
	Name string
	Charts []ChartManifest
	Terraform []TerraformManifest
}

func (wk *Workspace) BuildManifest() *Manifest {
	repository := wk.Installation.Repository
	charts := make([]ChartManifest, len(wk.Charts))
	terraform := make([]TerraformManifest, len(wk.Terraform))

	for i, ci := range wk.Charts {
		charts[i] = *buildChartManifest(&ci)
	}
	for i, ti := range wk.Terraform {
		terraform[i] = *buildTerraformManifest(&ti)
	}

	return &Manifest{repository.Id, repository.Name, charts, terraform}
}

func (m *Manifest) Write(path string) error {
	io, err := yaml.Marshal(&m)
	if (err != nil) {
		return err
	}

	return ioutil.WriteFile(path, io, 0644)
}

func buildChartManifest(chartInstallation *api.ChartInstallation) *ChartManifest {
	chart := chartInstallation.Chart
	version := chartInstallation.Version
	return &ChartManifest{chart.Id, chart.Name, version.Id, version.Version}
}

func buildTerraformManifest(tfInstallation *api.TerraformInstallation) *TerraformManifest {
	terraform := tfInstallation.Terraform
	return &TerraformManifest{terraform.Id, terraform.Name}
}