package manifest

import (
	"io/ioutil"
	"gopkg.in/yaml.v2"
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
	Hash string
	Cluster string
	Project string
	Bucket string
	Provider string
	Charts []ChartManifest
	Terraform []TerraformManifest
}

func (m *Manifest) Write(path string) error {
	io, err := yaml.Marshal(&m)
	if (err != nil) {
		return err
	}

	return ioutil.WriteFile(path, io, 0644)
}