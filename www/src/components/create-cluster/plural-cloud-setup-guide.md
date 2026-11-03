## Create your Plural instance

Plural Cloud hosts Console for you, with GitHub integration and Elastic and Prometheus observability set up by default. Want to run it yourself? Choose `Self-hosted` and use `plural up`.

### 1) Install the Plural CLI

With Homebrew:

```
brew install pluralsh/plural/plural
```

No Homebrew? Download a [pre-built release](https://github.com/pluralsh/plural-cli/releases) and add it to your PATH.

### 2) Create your management console

On Plural Cloud you don't need the CLI for this step:

1. Name your instance and pick a provider and region.
2. Click **Create instance**. The build takes a few minutes.
3. Close the tab if you like. You can check progress from Instances.

[Plural Cloud guide](https://docs.plural.sh/getting-started/first-steps/plural-cloud)

### 3) Connect the CLI to your console

Once your console is ready, log in with its URL and an access token:

```
plural cd login
```

Get a token at `/profile/access-tokens` in your console. You can also set `PLURAL_CONSOLE_URL` and `PLURAL_CONSOLE_TOKEN`.

Check it works:

```
plural cd clusters list
```

### 4) Add your first cluster

Inside the console, connect your source control, then run:

```
plural up --cloud
```

This sets up a GitOps repo with production-ready defaults and a small management cluster in your cloud, so Plural never needs your cloud keys. It takes about 10 minutes (longer on AWS). The cloud and region can differ from your Plural instance.

### Cleaning up

Delete the stacks and services Plural created (ideally by reverting the PRs it opened), then run:

```
plural down --cloud
```
