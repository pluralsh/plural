package scaffold

import (
	"bytes"
	"fmt"
	"github.com/michaeljguarino/forge/api"
	"github.com/michaeljguarino/forge/template"
	"github.com/michaeljguarino/forge/utils"
	"github.com/michaeljguarino/forge/wkspace"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const moduleTemplate = `module "{{ .Values.name }}" {
	source = "{{ .Values.path }}"

{{ .Values.conf | nindent 2 }}
{{ range $key, $val := .Values.deps }}
	{{ $key }} = module.{{ $val }}
{{- end }}
}
`

func (scaffold *Scaffold) handleTerraform(wk *wkspace.Workspace) error {
	repo := wk.Installation.Repository
	ctx := wk.Installation.Context
	var modules = make([]string, len(wk.Terraform)+1)
	backend, err := wk.Provider.CreateBackend(repo.Name)
	if err != nil {
		return err
	}

	if err := scaffold.untarModules(wk); err != nil {
		return err
	}

	modules[0] = backend
	for i, tfInst := range wk.Terraform {
		tf := tfInst.Terraform

		var buf bytes.Buffer
		buf.Grow(5 * 1024)
		tmpl, err := template.MakeTemplate(tf.ValuesTemplate)
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
		module["deps"] = tf.Dependencies.Wirings.Terraform

		var moduleBuf bytes.Buffer
		moduleBuf.Grow(1024)
		if err := template.RenderTemplate(&moduleBuf, moduleTemplate, module); err != nil {
			return err
		}

		modules[i+1] = moduleBuf.String()

		valuesFile := filepath.Join(scaffold.Root, tf.Name, "terraform.tfvars")
		os.Remove(valuesFile)

		moduleBuf.Reset()
		buf.Reset()
	}

	if err := utils.WriteFile(filepath.Join(scaffold.Root, "main.tf"), []byte(strings.Join(modules, "\n\n"))); err != nil {
		return err
	}

	return nil
}

// TODO: move to some sort of scaffold util?
func (scaffold *Scaffold) untarModules(wk *wkspace.Workspace) error {
	utils.Highlight("unpacking %d module(s)", len(wk.Terraform))
	for _, tfInst := range wk.Terraform {
		tf := tfInst.Terraform
		path := filepath.Join(scaffold.Root, tf.Name)
		if err := os.MkdirAll(path, os.ModePerm); err != nil {
			fmt.Print("\n")
			return err
		}

		if err := untar(&tf, path); err != nil {
			fmt.Print("\n")
			return err
		}
		fmt.Print(".")
	}

	utils.Success("\u2713\n")
	return nil
}

func untar(tf *api.Terraform, dir string) error {
	resp, err := http.Get(tf.Package)
	if err != nil {
		return err
	}

	return utils.Untar(resp.Body, dir, tf.Name)
}
