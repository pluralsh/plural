**chartmart**

cli for managing chartmart.  Includes utilities for creating workspaces, validating dependencies are satisfied and deploying workspaces.


```bash
> chartmart --help

NAME:
   chartmart - Tooling to manage your installed chartmart applications

USAGE:
   chartmart [global options] command [command options] [arguments...]

VERSION:
   0.0.0

COMMANDS:
   build, b      builds your workspace
   deploy, d     deploys the current workspace
   validate, v   validates your workspace
   topsort, d    renders a dependency-inferred topological sort of the installations in a workspace
   bounce, b     redeploys the charts in a workspace
   destroy, b    iterates through all installations in reverse topological order, deleting helm installations and terraform
   init          initializes charmart
   import        imports chartmart config from another file
   test          validate a values templace
   crypto        chartmart encryption utilities
   push          utilities for pushing tf or helm packages
   api           inspect the chartmart api
   config, conf  reads/modifies cli configuration
   help, h       Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --help, -h     show help
   --version, -v  print the version
```