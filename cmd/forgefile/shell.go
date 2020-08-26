package forgefile

import (
	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/utils"
)

type Shell struct {
	File string
}

func (a *Shell) Type() ComponentName {
	return SHELL
}

func (a *Shell) Key() string {
	return a.File
}

func (a *Shell) Push(repo string, sha string) (string, error) {
	newsha, err := executor.MkHash(a.File, []string{})
	if err != nil || newsha == sha {
		utils.Highlight("No change for %s\n", a.File)
		return sha, err
	}

	utils.Highlight("pushing shell %s", a.File)
	cmd, output := executor.SuppressedCommand("forge", "push", "shell", a.File, repo)

	err = executor.RunCommand(cmd, output)
	return newsha, err
}
