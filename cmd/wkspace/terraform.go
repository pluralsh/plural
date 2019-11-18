package wkspace

import (
	"bytes"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/utils"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

const moduleTemplate = `module "{{ .Values.name }}" {
	source = "{{ .Values.path }}"

{{ .Values.conf | nindent 2 }}
{{ range $key, $val := .Values.deps }}
	{{ $key }} = module.{{ $val }}
{{ end }}
}
`

type tfModule struct {
	name string
	path string
	conf string
	deps map[string]string
}

func (wk *Workspace) BuildTerraform() error {
	repo := wk.Installation.Repository
	ctx := wk.Installation.Context
	dir, _ := filepath.Abs(repo.Name)
	var modules = make([]string, len(wk.Terraform)+1)
	backend, err := wk.Provider.CreateBackend(repo.Name)
	if err != nil {
		return err
	}

	modules[0] = backend
	for i, tfInst := range wk.Terraform {
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
		tmpl, err := utils.MakeTemplate(tf.ValuesTemplate)
		if err != nil {
			return err
		}
		if err := tmpl.Execute(
			&buf, map[string]interface{}{"Values": ctx, "Cluster": wk.Provider.Cluster()}); err != nil {
			return err
		}

		module := make(map[string]interface{})
		module["name"] = tf.Name
		module["path"] = "./" + tf.Name
		module["conf"] = buf.String()
		module["deps"] = tf.Dependencies

		var moduleBuf bytes.Buffer
		moduleBuf.Grow(1024)
		if err := utils.RenderTemplate(&moduleBuf, moduleTemplate, module); err != nil {
			return err
		}

		modules[i+1] = moduleBuf.String()

		valuesFile := filepath.Join(dir, "terraform", tf.Name, "terraform.tfvars")
		os.Remove(valuesFile)

		moduleBuf.Reset()
		buf.Reset()
	}

	if err := utils.WriteFile(filepath.Join(dir, "terraform", "main.tf"), []byte(strings.Join(modules, "\n\n"))); err != nil {
		return err
	}

	return nil
}

func (w *Workspace) InstallTerraform() error {
	repo := w.Installation.Repository
	path, err := filepath.Abs(path.Join(repo.Name, "terraform"))
	if err != nil {
		return err
	}

	os.Chdir(path)
	if err := utils.Cmd(w.Config, "terraform", "init"); err != nil {
		return err
	}
	if err := utils.Cmd(w.Config, "terraform", "apply", "-auto-approve"); err != nil {
		return err
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
