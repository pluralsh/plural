package forgefile

import (
	"github.com/michaeljguarino/forge/utils"
	"github.com/michaeljguarino/forge/executor"
)

type Recipe struct {
	File string
}

func (a *Recipe) Type() ComponentName {
	return RECIPE
}

func (a *Recipe) Key() string {
	return a.File
}

func (a *Recipe) Push(repo string, sha string) (string, error) {
	newsha, err := executor.MkHash(a.File, []string{})
	if err != nil || newsha == sha {
		utils.Highlight("No change for %s\n", a.File)
		return sha, err
	}

	utils.Highlight("pushing recipe %s", a.File)
	cmd, output := executor.SuppressedCommand("forge", "push", "recipe", a.File, repo)

	err = executor.RunCommand(cmd, output)
	return newsha, err
}
