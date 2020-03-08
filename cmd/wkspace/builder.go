package wkspace

import (
	"io/ioutil"
	"os"
	"path"
	"path/filepath"

	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/crypto"
	"github.com/michaeljguarino/chartmart/manifest"
	"github.com/michaeljguarino/chartmart/provider"
	"github.com/michaeljguarino/chartmart/utils"
)

type Workspace struct {
	Provider     provider.Provider
	Installation *api.Installation
	Charts       []api.ChartInstallation
	Terraform    []api.TerraformInstallation
	Config       *config.Config
}

func New(client *api.Client, inst *api.Installation) (*Workspace, error) {
	ci, err := client.GetChartInstallations(inst.Repository.Id)
	if err != nil {
		return nil, err
	}
	ti, err := client.GetTerraformInstallations(inst.Repository.Id)
	if err != nil {
		return nil, err
	}

	var prov provider.Provider
	manifestPath := manifestPath(&inst.Repository)
	if utils.Exists(manifestPath) {
		manifest, err := manifest.Read(manifestPath)
		if err != nil {
			return nil, err
		}

		prov, err = provider.FromManifest(manifest)
		if err != nil {
			return nil, err
		}
	} else {
		prov, err = provider.Select()
		if err != nil {
			return nil, err
		}
	}
	conf := config.Read()
	return &Workspace{
		prov,
		inst,
		ci,
		ti,
		&conf,
	}, nil
}

func (wk *Workspace) ToMinimal() *MinimalWorkspace {
	return &MinimalWorkspace{
		Name:     wk.Installation.Repository.Name,
		Provider: wk.Provider,
		Config:   wk.Config,
	}
}

func (wk *Workspace) Prepare() error {
	repo := wk.Installation.Repository

	if err := mkDir(repo.Name, "terraform"); err != nil {
		return err
	}

	if err := mkDir(repo.Name, "helm"); err != nil {
		return err
	}

	manifest := wk.BuildManifest()
	if err := manifest.Write(manifestPath(&repo)); err != nil {
		return err
	}

	if err := wk.buildExecution(); err != nil {
		return err
	}

	if err := wk.BuildHelm(); err != nil {
		return err
	}

	if err := wk.BuildTerraform(); err != nil {
		return err
	}

	return nil
}

func (wk *Workspace) buildExecution() error {
	repoRoot, err := utils.RepoRoot()
	if err != nil {
		return err
	}
	name := wk.Installation.Repository.Name
	wkspaceRoot := filepath.Join(repoRoot, name)

	onceFile := filepath.Join(wkspaceRoot, "ONCE")
	if err := ioutil.WriteFile(onceFile, []byte("once"), 0644); err != nil {
		return err
	}

	nonceFile := filepath.Join(wkspaceRoot, "NONCE")
	if err := ioutil.WriteFile(nonceFile, []byte(crypto.RandString(32)), 0644); err != nil {
		return err
	}

	if _, err := GetExecution(filepath.Join(wkspaceRoot), "deploy"); err == nil {
		// already exists, so ignore
		return err
	}

	return DefaultExecution(name).Flush(repoRoot)
}

func mkDir(repoName, subDir string) error {
	path, err := filepath.Abs(path.Join(repoName, subDir))
	if err != nil {
		return err
	}
	if err := os.MkdirAll(path, os.ModePerm); err != nil {
		return err
	}
	return nil
}

func manifestPath(repo *api.Repository) string {
	path, _ := filepath.Abs(filepath.Join(repo.Name, "manifest.yaml"))
	return path
}
