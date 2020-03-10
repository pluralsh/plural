package scaffold

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/imdario/mergo"
	"github.com/michaeljguarino/chartmart/template"
	"github.com/michaeljguarino/chartmart/utils"
	"github.com/michaeljguarino/chartmart/wkspace"
	"gopkg.in/yaml.v2"
)

type dependency struct {
	Name       string
	Version    string
	Repository string
}

func (s *Scaffold) handleHelm(wk *wkspace.Workspace) error {
	repo := wk.Installation.Repository

	if _, err := s.createChart(wk, repo.Name); err != nil {
		return err
	}

	if err := s.createChartDependencies(wk, repo.Name); err != nil {
		return err
	}

	if err := s.buildChartValues(wk); err != nil {
		return err
	}

	return nil
}

func (s *Scaffold) createChartDependencies(w *wkspace.Workspace, name string) error {
	dependencies := make([]dependency, len(w.Charts))
	repo := w.Installation.Repository
	for i, chartInstallation := range w.Charts {
		dependencies[i] = dependency{
			chartInstallation.Chart.Name,
			chartInstallation.Version.Version,
			repoUrl(repo.Name),
		}
	}

	io, err := yaml.Marshal(map[string][]dependency{"dependencies": dependencies})
	if err != nil {
		return err
	}

	requirementsFile := filepath.Join(s.Root, "requirements.yaml")
	return utils.WriteFile(requirementsFile, io)
}

func (s *Scaffold) buildChartValues(w *wkspace.Workspace) error {
	ctx := w.Installation.Context
	var buf bytes.Buffer
	values := make(map[string]map[string]interface{})
	buf.Grow(5 * 1024)

	valuesFile := filepath.Join(s.Root, "values.yaml")
	prevVals, _ := prevValues(valuesFile)

	for _, chartInst := range w.Charts {
		tmpl, err := template.MakeTemplate(chartInst.Version.ValuesTemplate)
		if err != nil {
			return err
		}

		vals := map[string]interface{}{
			"Values":  ctx,
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

	if err := mergo.Merge(&values, prevVals); err != nil {
		return err
	}

	io, err := yaml.Marshal(values)
	if err != nil {
		return err
	}

	return utils.WriteFile(valuesFile, io)
}

func prevValues(filename string) (map[string]map[string]interface{}, error) {
	vals := make(map[string]map[interface{}]interface{})
	parsed := make(map[string]map[string]interface{})
	if !utils.Exists(filename) {
		return parsed, nil
	}

	contents, err := ioutil.ReadFile(filename)
	if err != nil {
		return parsed, err
	}
	if err := yaml.Unmarshal(contents, &vals); err != nil {
		return parsed, err
	}

	for k, v := range vals {
		parsed[k] = utils.CleanUpInterfaceMap(v)
	}

	return parsed, nil
}

func (s *Scaffold) createChart(w *wkspace.Workspace, name string) (string, error) {
	cdir := filepath.Join(s.Root, name)

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

func repoUrl(repo string) string {
	return "cm://mart.piazzaapp.com/cm/" + repo
}
