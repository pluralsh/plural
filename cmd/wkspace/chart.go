package wkspace

import (
	"github.com/michaeljguarino/chartmart/api"
	"github.com/michaeljguarino/chartmart/utils"
)

func (w *Workspace) DestroyHelm() error {
	w.Provider.KubeConfig()
	return utils.Cmd(w.Config, "helm", "del", "--purge", w.Installation.Repository.Name)
}

func (w *Workspace) Bounce() error {
	return w.ToMinimal().BounceHelm()
}

func repoUrl(repo *api.Repository) string {
	return "cm://mart.piazzaapp.com/cm/" + repo.Name
}
