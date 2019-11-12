package wkspace

import (
	"os"
	"net/http"
	"path"
	"path/filepath"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/utils"
)


func (wk *Workspace) BuildTerraform() error {
	repo := wk.Installation.Repository
	for _, tfInst := range wk.Terraform {
		tf := tfInst.Terraform
		path := terraformPath(&repo, &tf)
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			return err
		}

		if err := Extract(&tf, path); err != nil {
			return err
		}
	}
	return nil
}

func terraformPath(repo *api.Repository, tf *api.Terraform) string {
	p, _ := filepath.Abs(path.Join(repo.Name, "terraform", tf.Name))
	return p
}

func Extract(tf *api.Terraform, dir string) error {
	resp, err := http.Get(tf.Package)
	if err != nil {
		return err
	}

	return utils.Untar(resp.Body, dir, tf.Name)
}