package wkspace

import (
	"os"
	"path/filepath"

	"github.com/michaeljguarino/forge/config"
	"github.com/michaeljguarino/forge/manifest"
	"github.com/michaeljguarino/forge/provider"
	"github.com/michaeljguarino/forge/utils"
)

type MinimalWorkspace struct {
	Name     string
	Provider provider.Provider
	Config   *config.Config
}

func Minimal(name string) (*MinimalWorkspace, error) {
	root, err := utils.RepoRoot()
	if err != nil {
		return nil, err
	}

	path, _ := filepath.Abs(filepath.Join(root, name, "manifest.yaml"))
	var prov provider.Provider
	if utils.Exists(path) {
		manifest, err := manifest.Read(path)
		if err != nil {
			return nil, err
		}

		prov, err = provider.FromManifest(manifest)
		if err != nil {
			return nil, err
		}
	} else {
		prov, err = provider.Select()
		if err != nil {
			return nil, err
		}
	}

	conf := config.Read()
	return &MinimalWorkspace{Name: name, Provider: prov, Config: &conf}, nil
}

func (m *MinimalWorkspace) HelmInit(clientOnly bool) error {
	home, _ := os.UserHomeDir()
	helmRepos := filepath.Join(home, ".helm", "repository", "repositories.yaml")
	if !utils.Exists(helmRepos) && clientOnly {
		return utils.Cmd(m.Config, "helm", "init", "--client-only")
	}
	if !clientOnly && !utils.InKubernetes() {
		return utils.Cmd(m.Config, "helm", "init", "--wait", "--service-account=tiller")
	}

	return nil
}

const pullSecretName = "forgecreds"
const repoName = "dkr.piazza.app"

func (m *MinimalWorkspace) EnsurePullCredentials() error {
	name := m.Name
	if err := utils.Cmd(m.Config, "kubectl", "get", "secret", pullSecretName, "--namespace", name); err != nil {
		token := m.Config.Token
		username := m.Config.Email

		return utils.Cmd(m.Config,
			"kubectl", "create", "secret", "docker-registry", pullSecretName,
			"--namespace", name, "--docker-username", username, "--docker-password", token, "--docker-server", repoName)
	}

	return nil
}

func (m *MinimalWorkspace) BounceHelm() error {
	path, err := filepath.Abs(filepath.Join("helm", m.Name))
	if err != nil {
		return err
	}

	utils.Warn("helm upgrade --install --namespace %s %s %s\n", m.Name, m.Name, path)
	return utils.Cmd(m.Config,
		"helm", "upgrade", "--install", "--skip-crds", "--namespace", m.Name, m.Name, path)
}
