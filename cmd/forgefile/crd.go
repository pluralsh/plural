package forgefile

import (
	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/utils"
	"os"
	"os/exec"
)

type Crd struct {
	File  string
	Chart string
}

func (a *Crd) Type() ComponentName {
	return CRD
}

func (a *Crd) Key() string {
	return a.File
}

func (a *Crd) Push(repo string, sha string) (string, error) {
	newsha, err := executor.MkHash(a.File, []string{})
	if err != nil || newsha == sha {
		utils.Highlight("No change for %s\n", a.File)
		return sha, nil
	}

	utils.Highlight("pushing crd %s for %s\n", a.File, a.Chart)
	cmd := exec.Command("forge", "push", "crd", a.File, repo, a.Chart)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return newsha, cmd.Run()
}
