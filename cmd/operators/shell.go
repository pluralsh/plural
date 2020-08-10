package operators

import (
	"os"
	"os/exec"

	"github.com/michaeljguarino/forge/api"
)

func Shell(namespace string, shell *api.Shell) error {
	// kubectl exec -it -n silo deployment/silo-api -- /bin/sh
	cmd := exec.Command("kubectl", "exec", "-it", "-n", namespace, shell.Target, "--", "/bin/sh")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	return cmd.Run()
}
