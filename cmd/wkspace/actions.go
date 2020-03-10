package wkspace

import (
	"github.com/michaeljguarino/forge/utils"
	"os"
	"path"
	"path/filepath"
)

func (w *Workspace) DestroyHelm() error {
	w.Provider.KubeConfig()
	return utils.Cmd(w.Config, "helm", "del", "--purge", w.Installation.Repository.Name)
}

func (w *Workspace) Bounce() error {
	return w.ToMinimal().BounceHelm()
}

func (w *Workspace) DestroyTerraform() error {
	repo := w.Installation.Repository
	path, err := filepath.Abs(path.Join(repo.Name, "terraform"))
	if err != nil {
		return err
	}

	os.Chdir(path)
	return utils.Cmd(w.Config, "terraform", "destroy", "-auto-approve")
}
