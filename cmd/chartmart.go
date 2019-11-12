package main

import (
  "math/rand"
  "time"
  "log"
  "os"
  "github.com/urfave/cli"
  "github.com/michaeljguarino/chartmart/config"
  "github.com/michaeljguarino/chartmart/api"
)

func main() {
  rand.Seed(time.Now().UnixNano())
  app := cli.NewApp()
  app.Name = "chartmart"
  app.Usage = "Tooling to manage your installed chartmart applications"

  app.Commands = []cli.Command{
    {
      Name:    "build",
      Aliases: []string{"b"},
      Usage:   "builds your workspace",
      Action:  Build,
    },
    {
      Name:    "deploy",
      Aliases: []string{"d"},
      Usage:   "deploys the current workspace",
      Action:  Deploy,
    },
    {
      Name: "api",
      Usage: "inspect the chartmart api",
      Subcommands: api.Commands(),
    },
    {
      Name:    "config",
      Aliases: []string{"conf"},
      Usage:   "reads/modifies cli configuration",
      Subcommands: config.Commands(),
    },
  }

  err := app.Run(os.Args)
  if err != nil {
    log.Fatal(err)
  }
}