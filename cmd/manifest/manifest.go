package manifest

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path/filepath"
)

type ChartManifest struct {
	Id        string
	Name      string
	VersionId string
	Version   string
}

type TerraformManifest struct {
	Id   string
	Name string
}

type Dependency struct {
	Repo string
}

type Manifest struct {
	Id        string
	Name      string
	Cluster   string
	Project   string
	Bucket    string
	Provider  string
	Region    string
	License   string
	Charts    []ChartManifest
	Terraform []TerraformManifest
	Dependencies []Dependency
}

type ProjectManifest struct {
	Cluster string
	Bucket string
	Project string
	Provider string
	Region string
}

func ProjectManifestPath() string {
	path, _ := filepath.Abs("workspace.yaml")
	return path
}

func (m *ProjectManifest) Write(path string) error {
	io, err := yaml.Marshal(&m)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(path, io, 0644)
}

func ReadProject(path string) (*ProjectManifest, error) {
	contents, err := ioutil.ReadFile(path)
	man := ProjectManifest{}
	if err != nil {
		return &man, err
	}
	if err := yaml.Unmarshal(contents, &man); err != nil {
		return &man, err
	}

	return &man, nil
}

func (m *Manifest) Write(path string) error {
	io, err := yaml.Marshal(&m)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(path, io, 0644)
}

func Read(path string) (*Manifest, error) {
	contents, err := ioutil.ReadFile(path)
	man := Manifest{}
	if err != nil {
		return &man, err
	}
	if err := yaml.Unmarshal(contents, &man); err != nil {
		return &man, err
	}

	return &man, nil
}