package main

import (
  "log"
  "os"
  "github.com/urfave/cli"
  "github.com/michaeljguarino/chartmart/config"
)

func main() {
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
      Name:    "config",
      Aliases: []string{"conf"},
      Usage:   "reads/modifies cli configuration",
      Subcommands: []cli.Command{
        {
          Name:  "amend",
          Usage: "modify config",
          ArgsUsage: "[key] [value]",
          Action: config.HandleAmend,
        },
        {
          Name:  "read",
          Usage: "dumps config",
          ArgsUsage: "",
          Action: config.HandleRead,
        },
      },
    },
  }

  err := app.Run(os.Args)
  if err != nil {
    log.Fatal(err)
  }
}