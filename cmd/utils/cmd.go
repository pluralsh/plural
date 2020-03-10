package utils

import (
	"github.com/michaeljguarino/forge/config"
	"os"
	"os/exec"
)

func Cmd(conf *config.Config, program string, args ...string) error {
	return MkCmd(conf, program, args...).Run()
}

func MkCmd(conf *config.Config, program string, args ...string) *exec.Cmd {
	cmd := exec.Command(program, args...)
	os.Setenv("HELM_REPO_ACCESS_TOKEN", conf.Token)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd
}
