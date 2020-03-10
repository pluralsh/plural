**forge**

cli for managing forge.  Includes utilities for creating workspaces, validating dependencies are satisfied and deploying workspaces.


```bash
> forge --help

NAME:
   forge - Tooling to manage your installed forge applications

USAGE:
   forge [global options] command [command options] [arguments...]

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
   import        imports forge config from another file
   test          validate a values templace
   crypto        forge encryption utilities
   push          utilities for pushing tf or helm packages
   api           inspect the forge api
   config, conf  reads/modifies cli configuration
   help, h       Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --help, -h     show help
   --version, -v  print the version
```