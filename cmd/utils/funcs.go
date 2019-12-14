package utils

import (
	"strings"
	"os/exec"
	"path"
)

func repoRoot() (string, error) {
	cmd := exec.Command("git", "rev-parse", "--show-toplevel")
	res, err := cmd.CombinedOutput()
	return strings.TrimSpace(string(res)), err
}

func repoName() (string, error) {
	root, err := repoRoot()
	return path.Base(root), err
}

func repoUrl() (string, error) {
	cmd := exec.Command("git", "config", "--get", "remote.origin.url")
	res, err := cmd.CombinedOutput()
	return strings.TrimSpace(string(res)), err
}