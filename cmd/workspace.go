package main

import (
	"github.com/urfave/cli"
	"github.com/michaeljguarino/chartmart/wkspace"
)

func workspaceCommands() []cli.Command {
	return []cli.Command{
		{
			Name:      "docker-credentials",
			Usage:     "create a docker credentials secret for this workspace",
			ArgsUsage: "NAME",
			Action:    ensureDockerCredentials,
		},
		{
			Name:      "helm-init",
			Usage:     "pushes a helm chart",
			ArgsUsage: "NAME",
			Action:    helmInit,
		},
		{
			Name:      "kube-init",
			Usage:     "generates kubernetes credentials for this subworkspace",
			ArgsUsage: "NAME",
			Action:    kubeInit,
		},
		{
			Name:      "helm",
			Usage:     "upgrade/installs the helm chart for this subworkspace",
			ArgsUsage: "NAME",
			Action:    bounceHelm,
		},
	}
}

func ensureDockerCredentials(c *cli.Context) error {
	name := c.Args().Get(0)
	minimal, err := wkspace.Minimal(name)
	if err != nil {
		return err
	}

	return minimal.EnsurePullCredentials()
}

func helmInit(c *cli.Context) error {
	name := c.Args().Get(0)
	minimal, err := wkspace.Minimal(name)
	if err != nil {
		return err
	}

	return minimal.HelmInit(false)
}

func kubeInit(c *cli.Context) error {
	name := c.Args().Get(0)
	minimal, err := wkspace.Minimal(name)
	if err != nil {
		return err
	}

	return minimal.Provider.KubeConfig()
}

func bounceHelm(c *cli.Context) error {
	name := c.Args().Get(0)
	minimal, err := wkspace.Minimal(name)
	if err != nil {
		return err
	}

	return minimal.BounceHelm()
}