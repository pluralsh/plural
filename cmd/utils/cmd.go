package utils

import (
	"fmt"
	"os"
	"os/exec"
	"github.com/michaeljguarino/chartmart/config"
)

func Cmd(conf *config.Config, program string, args ...string) error {
	return MkCmd(conf, program, args...).Run()
}

func MkCmd(conf *config.Config, program string, args ...string) *exec.Cmd {
	cmd := exec.Command(program, args...)
	env := os.Environ()
	env = append(env, fmt.Sprintf("HELM_REPO_ACCESS_TOKEN=%s", conf.Token))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd
}