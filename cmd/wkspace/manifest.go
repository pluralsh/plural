package wkspace

import (
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/manifest"
	"github.com/michaeljguarino/chartmart/utils"
	"gopkg.in/yaml.v2"
	"io/ioutil"
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
	hash := utils.HashPwd(wk.MasterPassword)
	return &manifest.Manifest{
		repository.Id,
		repository.Name,
		hash,
		wk.Provider.Cluster(),
		wk.Provider.Project(),
		wk.Provider.Bucket(),
		wk.Provider.Name(),
		charts,
		terraform,
	}
}

func ReadManifest(path string) (*manifest.Manifest, error) {
	contents, err := ioutil.ReadFile(path)
	man := manifest.Manifest{}
	if err != nil {
		return &man, err
	}
	if err := yaml.Unmarshal(contents, &man); err != nil {
		return &man, err
	}

	return &man, nil
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
