# Chartmart

A repository of helm charts, implementing authorization on top of chartmuseum along with bookkeeping around installations, discovery, etc.

There are two components, a web-app/api and a cli.  You can select the repos you'd like to install and the chart versions/terraform modules you specifically want, then with a few commands, the cli will build a production-ready workspace for it which can be easily deployed.  If you're a developer, you can register a publisher for yourself and upload your own charts/repos for use by others.

The workflow is basically (after selecting your preferences):

```bash
chartmart build
chartmart deploy <repo>
```

An example deployment can be found at: https://mart.piazzaapp.com

## Features

The charmart workflow provides the following:

* Authenticated docker registry per repository
* License generation
* Authenticated chartmuseum proxy for each repository
* secret encryption using AES-256 (so you can keep the entire workflow in git)
* templating using a shared context between tf and helm to reduce the drift between duplicated configuration
* Automatic README extraction for documentation on the site

## Dependencies

To properly work, you will need installations of terraform and helm. In addition, the helm push plugin is used to interface with chartmuseum, which is used for versioned storage of helm charts. On mac, you can simply do:

```bash
brew install terraform
brew install kubernetes-helm
helm plugin install https://github.com/chartmuseum/helm-push
```

## Build

To run tests for the api:

```bash
mix deps.get # ignore if you've already fetched
make testup
mix test
```

To build the `chartmart` cli:

```bash
make cli
```

and copy cmd/chartmart to your path.

alternatively, if you don't mind `go install`, you can `cd cmd && go install`