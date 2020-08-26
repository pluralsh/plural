package forgefile

import (
	"github.com/michaeljguarino/forge/utils"
	"github.com/michaeljguarino/forge/executor"
)

type Helm struct {
	File string
}

func (a *Helm) Type() ComponentName {
	return HELM
}

func (a *Helm) Key() string {
	return a.File
}

func (a *Helm) Push(repo string, sha string) (string, error) {
	newsha, err := executor.MkHash(a.File, []string{})
	if err != nil || newsha == sha {
		utils.Highlight("No change for %s\n", a.File)
		return sha, nil
	}

	utils.Highlight("pushing helm %s", a.File)
	cmd, output := executor.SuppressedCommand("forge", "push", "helm", a.File, repo)

	err = executor.RunCommand(cmd, output)
	return newsha, err
}
