package wkspace

import (
	"fmt"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/provider"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/michaeljguarino/chartmart/config"
	"github.com/michaeljguarino/chartmart/manifest"
	"os"
	"path"
	"path/filepath"
)

type Workspace struct {
	MasterPassword string
	Provider       provider.Provider
	Installation   *api.Installation
	Charts         []api.ChartInstallation
	Terraform      []api.TerraformInstallation
	Config  		   *config.Config
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
	pwd, err := utils.ReadPwd("Enter your master password: ")
	fmt.Println("")
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

		if !utils.VerifyPwd(manifest.Hash, string(pwd)) {
			return nil, fmt.Errorf("invalid password")
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
		string(pwd),
		prov,
		inst,
		ci,
		ti,
		&conf,
	}, nil
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

	if err := wk.BuildHelm(); err != nil {
		return err
	}

	if err := wk.BuildTerraform(); err != nil {
		return err
	}

	return nil
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
	path, _ := filepath.Abs(path.Join(repo.Name, "manifest.yaml"))
	return path
}
