package forgefile

import (
	"os"
	"os/exec"

	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/utils"
)

type Artifact struct {
	File string
}

func (a *Artifact) Type() ComponentName {
	return ARTIFACT
}

func (a *Artifact) Key() string {
	return a.File
}

func (a *Artifact) Push(repo string, sha string) (string, error) {
	newsha, err := executor.MkHash(a.File, []string{})
	if err != nil || newsha == sha {
		utils.Highlight("No change for %s\n", a.File)
		return sha, err
	}

	utils.Highlight("pushing artifact %s\n", a.File)
	cmd := exec.Command("forge", "push", "artifact", a.File, repo)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	return newsha, err
}
