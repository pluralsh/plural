# Chartmart

A repository of helm charts, implementing authorization on top of chartmuseum along with bookkeeping around installations, discovery, etc.

There are two components, a web-app/api and a cli.  You can select the repos you'd like to install and the chart versions/terraform modules you specifically want, then with a few commands, the cli will build a production-ready workspace for it which can be easily deployed.  If you're a developer, you can register a publisher for yourself and upload your own charts/repos for use by others.

The workflow is basically (after selecting your preferences):

```bash
chartmart build
chartmart deploy <repo>
```

An example deployment can be found at: https://mart.piazzaapp.com

## Guarantees

The charmart workflow provides the following:

* secret encryption using AES-256 (so you can keep the entire workflow in git)
* proper preservation of existing configuration on version upgrade
* templating using a shared context between tf and helm to reduce the drift between duplicated configuration
* Automatic README extraction for documentation on the site


In the future, I'll add some dependency validation, license key generation, and a managed docker registry authenticated using the same mechanism as chartmart itself (so public repos are not necessary).