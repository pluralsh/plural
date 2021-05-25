# Plural

A full lifecycle third party deployment control plane .

There are three components, a web-app/api, a cli, and a webhook receiver installable in-cluster.  You can select the repos you'd like to install and the chart versions/terraform modules you specifically want, then with a few commands, the cli will build a production-ready workspace for it which can be easily deployed.  If you're a developer, you can register a publisher for yourself and upload your own charts/repos for use by others.  And if you choose, the auto-upgrader can listen to webhooks and handle the deployment process entirely for you, including the annoying git minutiae.

The workflow is basically (after selecting your preferences):

```bash
plural build
plural deploy
```

An example deployment can be found at: https://app.plural.sh

## Features

The plural workflow provides the following:

* Authenticated docker registry per repository
* License generation using RSA + AES
* Authenticated chartmuseum proxy for each repository
* secret encryption using AES-256 (so you can keep the entire workflow in git)
* templating using a shared context between tf and helm to reduce the drift between duplicated configuration
* Automatic README extraction for documentation on the site
* dependency management between tf/helm modules, with dependency aware deployment in the cli
* auto-upgrading with real-time log feedback, and web-based configuration editing
* billing management, with line item billing, usage limiting, and feature differentiation (core SaaS pricing constructs)
* email proxy, so you don't need to have customers configure their own email servers
  - in the future a push notification proxy will be added
* deployment secret ingestion, for transfering low-value secrets (like publishable keys, giphy tokens) to deployed releases using the same encryption as the licensing uses (RSA + AES)

## Dependencies

To properly work, you will need installations of terraform and helm. In addition, the helm push plugin is used to interface with chartmuseum, which is used for versioned storage of helm charts. On mac, you can simply do:

```bash
brew install terraform
brew install kubernetes-helm
helm plugin install https://github.com/chartmuseum/helm-push
```

## Build & Test

To run tests for the api:

```bash
mix deps.get # ignore if you've already fetched
make testup
mix test
```

## CLI install

The cli is split into the plural-cli repo, and can be installed using plural's artifacts api, eg

```bash
wget -O plural 'https://app.plural.sh/artifacts/plural/plural?platform=mac&arch=amd64'
chmod +x ./plural
mv plural /usr/local/bin/plural # or another dir on your path
```