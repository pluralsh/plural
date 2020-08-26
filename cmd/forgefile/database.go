package forgefile

import (
	"github.com/michaeljguarino/forge/executor"
	"github.com/michaeljguarino/forge/utils"
)

type Database struct {
	File string
}

func (a *Database) Type() ComponentName {
	return DATABASE
}

func (a *Database) Key() string {
	return a.File
}

func (a *Database) Push(repo string, sha string) (string, error) {
	newsha, err := executor.MkHash(a.File, []string{})
	if err != nil || newsha == sha {
		utils.Highlight("No change for %s\n", a.File)
		return sha, err
	}

	utils.Highlight("pushing db %s", a.File)
	cmd, output := executor.SuppressedCommand("forge", "push", "database", a.File, repo)

	err = executor.RunCommand(cmd, output)
	return newsha, err
}
