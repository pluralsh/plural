package operators

import (
	"os"
	"os/exec"

	"github.com/michaeljguarino/forge/api"
)

func Shell(namespace string, shell *api.Shell) error {
	var rest []string
	if len(shell.Command) > 0 {
		rest = append([]string{"-e", shell.Command}, shell.Args...)
	}
	args := []string{"exec", "-it", "-n", namespace, shell.Target, "--", "/bin/sh"}
	args = append(args, rest...)
	cmd := exec.Command("kubectl", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	return cmd.Run()
}
