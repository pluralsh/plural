package executor

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/michaeljguarino/forge/utils"
	"golang.org/x/mod/sumdb/dirhash"
)

type Step struct {
	Name    string   `hcl:",key"`
	Wkdir   string   `hcl:"wkdir"`
	Target  string   `hcl:"target"`
	Command string   `hcl:"command"`
	Args    []string `hcl:"args"`
	Sha     string   `hcl:"sha"`
}

func SuppressedCommand(command string, args ...string) (cmd *exec.Cmd, output *OutputWriter) {
	cmd = exec.Command(command, args...)
	output = &OutputWriter{delegate: os.Stdout}
	cmd.Stdout = output
	cmd.Stderr = output
	return
}

func RunCommand(cmd *exec.Cmd, output *OutputWriter) (err error) {
	err = cmd.Run()
	if err != nil {
		fmt.Printf("\nOutput:\n\n%s\n", output.Format())
		return
	}

	utils.Success("\u2713\n")
	return
}

func (step Step) Execute(root string, ignore []string) (string, error) {
	current, err := MkHash(filepath.Join(root, step.Target), ignore)
	if err != nil {
		return step.Sha, err
	}

	utils.Highlight("%s %s ~> ", step.Command, strings.Join(step.Args, " "))
	if current == step.Sha {
		utils.Success("no changes to be made for %s\n", step.Name)
		return current, nil
	}

	cmd, output := SuppressedCommand(step.Command, step.Args...)
	cmd.Dir = filepath.Join(root, step.Wkdir)
	err = RunCommand(cmd, output)
	if err != nil {
		return step.Sha, err
	}

	return current, err
}

func MkHash(root string, ignore []string) (string, error) {
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
		trimmed := strings.TrimPrefix(file, root)
		if ignorePath(trimmed, ignore) {
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
