package wkspace

import (
	"os"
	"net/http"
	"path"
	"bytes"
	"path/filepath"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/utils"
)


func (wk *Workspace) BuildTerraform() error {
	repo := wk.Installation.Repository
	ctx := wk.Installation.Context
	dir, _ := filepath.Abs(repo.Name)
	for _, tfInst := range wk.Terraform {
		tf := tfInst.Terraform
		path := terraformPath(&repo, &tf)
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			return err
		}

		if err := Extract(&tf, path); err != nil {
			return err
		}

		var buf bytes.Buffer
		buf.Grow(5 * 1024)
		if err := utils.RenderTemplate(&buf, tf.ValuesTemplate, ctx); err != nil {
			return err
		}

		valuesFile := filepath.Join(dir, "terraform", tf.Name,  "terraform.tfvars")
		if err := utils.WriteFile(valuesFile, buf.Bytes()); err != nil {
			return err
		}
		buf.Reset()
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