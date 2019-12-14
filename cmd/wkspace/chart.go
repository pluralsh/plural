package wkspace

import (
	"bytes"
	"fmt"
	"github.com/imdario/mergo"
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/michaeljguarino/chartmart/template"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"os"
	"path/filepath"
)

const defaultChartfile = `apiVersion: v1
name: %s
description: A Helm chart for Kubernetes
version: 0.1.0
appVersion: 1.16.0
`

const defaultIgnore = `# Patterns to ignore when building packages.
# This supports shell glob matching, relative path matching, and
# negation (prefixed with !). Only one pattern per line.
.DS_Store
# Common VCS dirs
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
# Common backup files
*.swp
*.bak
*.tmp
*~
# Various IDEs
.project
.idea/
*.tmproj
.vscode/
`

const defaultNotes = `Placeholder for now`
const sep = string(filepath.Separator)

const (
	// ChartfileName is the default Chart file name.
	ChartfileName = "Chart.yaml"
	// ValuesfileName is the default values file name.
	TemplatesDir = "templates"
	// ChartsDir is the relative directory name for charts dependencies.
	ChartsDir = "charts"
	// IgnorefileName is the name of the Helm ignore file.
	IgnorefileName = ".helmignore"
	// NotesName is the name of the example NOTES.txt file.
	NotesName = TemplatesDir + sep + "NOTES.txt"
)

type dependency struct {
	Name       string
	Version    string
	Repository string
}

func (wk *Workspace) BuildHelm() error {
	repo := wk.Installation.Repository
	helmPath := filepath.Join(repo.Name, "helm")
	if _, err := wk.CreateChart(repo.Name, helmPath); err != nil {
		return err
	}

	if err := wk.CreateChartDependencies(repo.Name, helmPath); err != nil {
		return err
	}

	if err := wk.FinalizeCharts(); err != nil {
		return err
	}

	if err := wk.BuildChartValues(); err != nil {
		return err
	}

	return nil
}

func (w *Workspace) CreateChartDependencies(name, dir string) error {
	dependencies := make([]dependency, len(w.Charts))
	for i, chartInstallation := range w.Charts {
		dependencies[i] = *buildDependency(&w.Installation.Repository, &chartInstallation)
	}

	io, err := yaml.Marshal(map[string][]dependency{"dependencies": dependencies})
	if err != nil {
		return err
	}

	requirementsFile := filepath.Join(dir, name, "requirements.yaml")
	return utils.WriteFile(requirementsFile, io)
}

func (w *Workspace) FinalizeCharts() error {
	repo := w.Installation.Repository
	repoUrl := repoUrl(&repo)

	utils.Cmd(w.Config, "helm", "repo", "add", repo.Name, repoUrl)
	cmd := utils.MkCmd(w.Config, "helm", "dependency", "update")

	helmPath, err := filepath.Abs(filepath.Join(repo.Name, "helm", repo.Name))
	if err != nil {
		return err
	}

	cmd.Dir = helmPath
	return cmd.Run()
}

func (w *Workspace) BuildChartValues() error {
	ctx := w.Installation.Context
	var buf bytes.Buffer
	values := make(map[string]map[string]interface{})
	buf.Grow(5 * 1024)

	repo := w.Installation.Repository
	dir, _ := filepath.Abs(repo.Name)
	valuesFile := filepath.Join(dir, "helm", repo.Name, "values.yaml")
	prevVals, _ := prevValues(valuesFile)

	for _, chartInst := range w.Charts {
		tmpl, err := template.MakeTemplate(chartInst.Version.ValuesTemplate)
		if err != nil {
			return err
		}

		vals := map[string]interface{}{
			"Values": ctx,
			"License": w.Installation.License,
		}
		for k, v := range prevVals {
			vals[k] = v
		}

		if err := tmpl.Execute(&buf, vals); err != nil {
			return err
		}

		var subVals map[string]interface{}
		if err := yaml.Unmarshal(buf.Bytes(), &subVals); err != nil {
			return err
		}

		values[chartInst.Chart.Name] = subVals
		buf.Reset()
	}

	if err := mergo.Merge(&values, prevVals, mergo.WithOverride); err != nil {
    return err
	}

	io, err := yaml.Marshal(values)
	if err != nil {
		return err
	}

	return utils.WriteFile(valuesFile, io)
}

func prevValues(filename string) (map[string]map[string]interface{}, error) {
	vals := make(map[string]map[string]interface{})
	if !utils.Exists(filename) {
		return vals, nil
	}
	fmt.Println("\"Safely\" merging in previous values")
	contents, err := ioutil.ReadFile(filename)
	if err != nil {
		return vals, err
	}
	if err := yaml.Unmarshal(contents, &vals); err != nil {
		return vals, err
	}
	return vals, nil
}

func (w *Workspace) CreateChart(name, dir string) (string, error) {
	path, err := filepath.Abs(dir)
	if err != nil {
		return path, err
	}

	if fi, err := os.Stat(path); err != nil {
		return path, err
	} else if !fi.IsDir() {
		return path, errors.Errorf("no such directory %s", path)
	}

	cdir := filepath.Join(path, name)
	if fi, err := os.Stat(cdir); err == nil && !fi.IsDir() {
		return cdir, errors.Errorf("file %s already exists and is not a directory", cdir)
	}

	files := []struct {
		path    string
		content []byte
	}{
		{
			// Chart.yaml
			path:    filepath.Join(cdir, ChartfileName),
			content: []byte(fmt.Sprintf(defaultChartfile, name)),
		},
		{
			// .helmignore
			path:    filepath.Join(cdir, IgnorefileName),
			content: []byte(defaultIgnore),
		},
		{
			// NOTES.txt
			path:    filepath.Join(cdir, NotesName),
			content: []byte(defaultNotes),
		},
	}

	for _, file := range files {
		if _, err := os.Stat(file.path); err == nil {
			// File exists and is okay. Skip it.
			continue
		}
		if err := utils.WriteFile(file.path, file.content); err != nil {
			return cdir, err
		}
	}
	// Need to add the ChartsDir explicitly as it does not contain any file OOTB
	if err := os.MkdirAll(filepath.Join(cdir, ChartsDir), 0755); err != nil {
		return cdir, err
	}
	return cdir, nil
}

func (w *Workspace) InstallHelm() error {
	w.Provider.KubeConfig()

	if err := utils.Cmd(w.Config, "helm", "init", "--wait", "--service-account=tiller"); err != nil {
		return err
	}

	if err := w.ensurePullCredentials(); err != nil {
		return err
	}

	return w.Bounce()
}

const pullSecretName = "chartmartcreds"
const repoName = "dkr.piazzaapp.com"

func (w *Workspace) ensurePullCredentials() error {
	name := w.Installation.Repository.Name
	if err := utils.Cmd(w.Config, "kubectl", "get", "secret", pullSecretName, "--namespace", name); err != nil {
		token := w.Config.Token
		username := w.Config.Email

		return utils.Cmd(w.Config,
			"kubectl", "create", "secret", "docker-registry", pullSecretName,
					"--namespace", name, "--docker-username", username, "--docker-password", token, "--docker-server", repoName)
	}

	return nil
}

func (w *Workspace) Bounce() error {
	repo := w.Installation.Repository
	path, err := filepath.Abs(filepath.Join(repo.Name, "helm", repo.Name))
	if err != nil {
		return err
	}

	utils.Warn("helm upgrade --install --namespace %s %s %s\n", repo.Name, repo.Name, path)
	return utils.Cmd(w.Config,
		"helm", "upgrade", "--install", "--namespace", repo.Name, repo.Name, path)
}

func buildDependency(repo *api.Repository, chartInstallation *api.ChartInstallation) *dependency {
	return &dependency{chartInstallation.Chart.Name, chartInstallation.Version.Version, repoUrl(repo)}
}

func repoUrl(repo *api.Repository) string {
	return "cm://mart.piazzaapp.com/cm/" + repo.Name
}
