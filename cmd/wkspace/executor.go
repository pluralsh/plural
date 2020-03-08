package wkspace

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/michaeljguarino/chartmart/utils"
	"golang.org/x/mod/sumdb/dirhash"
	"gopkg.in/yaml.v2"
)

type Execution struct {
	Path  string
	Name  string
	Steps []*Step
}

type Step struct {
	Name    string
	Wkdir   string
	Target  string
	Command string
	Args    []string
	Sha     string
}

type outputWriter struct {
	delegate    io.WriteCloser
	useDelegate bool
	lines       []string
}

const (
	forgeIgnore = `terraform/.terraform
`
)

func GetExecution(path, name string) (*Execution, error) {
	fullpath := filepath.Join(path, name+".yaml")
	contents, err := ioutil.ReadFile(fullpath)
	if err != nil {
		return nil, err
	}

	ex := Execution{}
	err = yaml.Unmarshal(contents, &ex)
	if err != nil {
		return &ex, err
	}

	return &ex, nil
}

func (e *Execution) Execute() error {
	root, err := utils.RepoRoot()
	if err != nil {
		return err
	}
	ignore, err := e.IgnoreFile(root)

	utils.Warn("deploying %s, hold on to your butts\n", e.Path)
	for i, step := range e.Steps {
		os.Chdir(filepath.Join(root, step.Wkdir))

		newSha, err := step.Execute(root, ignore)
		if err != nil {
			if err := e.Flush(root); err != nil {
				return err
			}

			return err
		}

		e.Steps[i].Sha = newSha
	}

	return e.Flush(root)
}

func (step Step) Execute(root string, ignore []string) (string, error) {
	current, err := mkhash(filepath.Join(root, step.Target), ignore)
	if err != nil {
		return step.Sha, err
	}

	utils.Highlight("%s %s ~> ", step.Command, strings.Join(step.Args, " "))
	if current == step.Sha {
		utils.Success("no changes to be made for %s\n", step.Name)
		return current, nil
	}

	cmd := exec.Command(step.Command, step.Args...)
	output := &outputWriter{delegate: os.Stdout}
	cmd.Stdout = output
	cmd.Stderr = output
	err = cmd.Run()
	if err != nil {
		fmt.Printf("\noutput: %s\n", output.Format())
		return step.Sha, err
	}

	utils.Success("\u2713\n")
	return current, err
}

func (e *Execution) IgnoreFile(root string) ([]string, error) {
	ignorePath := filepath.Join(root, e.Path, ".forgeignore")
	contents, err := ioutil.ReadFile(ignorePath)
	if err != nil {
		return []string{}, err
	}

	return strings.Split(string(contents), "\n"), nil
}

func DefaultExecution(path string, prev *Execution) (e *Execution) {
	byName := make(map[string]*Step)
	for _, step := range prev.Steps {
		byName[step.Name] = step
	}

	intended := &Execution{
		Path: path,
		Name: "deploy",
		Steps: []*Step{
			{
				Name:    "terraform-init",
				Wkdir:   filepath.Join(path, "terraform"),
				Target:  filepath.Join(path, "terraform"),
				Command: "terraform",
				Args:    []string{"init"},
				Sha:     "",
			},
			{
				Name:    "terraform-apply",
				Wkdir:   filepath.Join(path, "terraform"),
				Target:  filepath.Join(path, "terraform"),
				Command: "terraform",
				Args:    []string{"apply", "-auto-approve"},
				Sha:     "",
			},
			{
				Name:    "kube-init",
				Wkdir:   path,
				Target:  filepath.Join(path, "NONCE"),
				Command: "chartmart",
				Args:    []string{"wkspace", "kube-init", path},
				Sha:     "",
			},
			{
				Name:    "helm-init",
				Wkdir:   path,
				Target:  filepath.Join(path, "ONCE"),
				Command: "chartmart",
				Args:    []string{"wkspace", "helm-init", path},
				Sha:     "",
			},
			{
				Name:    "docker-credentials",
				Wkdir:   path,
				Target:  filepath.Join(path, "ONCE"),
				Command: "chartmart",
				Args:    []string{"wkspace", "docker-credentials", path},
				Sha:     "",
			},
			{
				Name:    "bounce",
				Wkdir:   path,
				Target:  filepath.Join(path, "helm"),
				Command: "chartmart",
				Args:    []string{"wkspace", "helm", path},
				Sha:     "",
			},
		},
	}

	for _, step := range intended.Steps {
		if val, ok := byName[step.Name]; ok {
			step.Sha = val.Sha // preserve shas where appropriate
		}
	}

	return intended
}

func (e *Execution) Flush(root string) error {
	io, err := yaml.Marshal(&e)
	if err != nil {
		return err
	}

	path, _ := filepath.Abs(filepath.Join(root, e.Path, e.Name+".yaml"))
	return ioutil.WriteFile(path, io, 0644)
}

func mkhash(root string, ignore []string) (string, error) {
	fi, err := os.Stat(root)
	if err != nil {
		return "", err
	}

	switch mode := fi.Mode(); {
	case mode.IsDir():
		return filteredHash(root, ignore)
	default:
		return utils.Sha256(root)
	}
}

func filteredHash(root string, ignore []string) (string, error) {
	prefix := filepath.Base(root)
	files, err := dirhash.DirFiles(root, prefix)
	if err != nil {
		return "", err
	}

	keep := []string{}
	for _, file := range files {
		if ignorePath(strings.TrimPrefix(file, prefix), ignore) {
			continue
		}

		keep = append(keep, file)
	}

	osOpen := func(name string) (io.ReadCloser, error) {
		return os.Open(filepath.Join(root, strings.TrimPrefix(name, prefix)))
	}

	return dirhash.Hash1(keep, osOpen)
}

func ignorePath(file string, ignore []string) bool {
	for _, pref := range ignore {
		if strings.HasPrefix(file, pref) {
			return true
		}
	}

	return false
}

func (out *outputWriter) Write(line []byte) (int, error) {
	if out.useDelegate {
		return out.delegate.Write(line)
	}

	out.lines = append(out.lines, string(line))
	out.delegate.Write([]byte("."))
	return len(line), nil
}

func (out *outputWriter) Close() error {
	return out.delegate.Close()
}

func (out *outputWriter) Format() string {
	return strings.Join(out.lines, "")
}
