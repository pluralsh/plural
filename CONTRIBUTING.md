# Contributing
From opening a bug report to creating a pull request: every contribution is appreciated and welcome.


## Development

Plural's server side is written in elixir, and exposes a graphql api. The frontend is in react, all code lives in this single repo and common development tasks can be done using the Makefile at the root of the repo.


### Developing Web
To begin developing the web app, install [node](https://nodejs.org/en/download/) & [yarn](https://classic.yarnpkg.com/en/docs/getting-started/), then run:

```sh
make web-install
make web
```

In chrome, you may get a warning saying "Your connection is not private". To resolve it, enable the `chrome://flags/#allow-insecure-localhost` flag and restart your browser.

### Developing Server

To make changes to the server codebase, you'll want to [install elixir](https://elixir-lang.org/install.html) on your machine. For mac desktops, we do this via [asdf](https://asdf-vm.com/guide/getting-started.html), which can be done simply at the root of the repo like so:

```sh
asdf plugin add erlang
asdf plugin add elixir
asdf install
```

asdf can be finnicky when instlalling erlang with mac, in which case you can reshim it like so from homebrew:

```sh
brew install erlang@24
cp -r /opt/homebrew/opt/erlang@24/lib/erlang ~/.asdf/installs/erlang/24.3.4.13
asdf reshim erlang 24.3.4.13
```

<!-- >
  Remove this line if irrelevant in the future
</!-->
In case you're running into this error: `configure: error: cannot find required auxiliary files: install-sh config.guess config.sub` you may consider this [GitHub issue](https://github.com/asdf-vm/asdf-erlang/issues/195#issuecomment-815999279) then re-run `asdf install`.

All server dependencies are managed via [docker-compose](https://www.docker.com/):

```sh
docker compose up
```

Initializing the db can be done with:

```sh
make core-setup
```

Tests can be run via `mix`, like so:

```sh
make testup
mix test
```

Working on the emails can be done with:

```sh
cd apps/email && iex -S mix phx.server
```

Then sending a text email can be done with:

```sh
Email.Helper.confirm_email("foo@plural.sh")
```

Your email will show up at http://localhost:4002/sent_emails


### Server Architecture

<img src="www/public/architecture.png"></img>

The Plural server codebase uses an elixir umbrella application to organize itself, and splits into three main deployments:

* api - hosting the main graphql api
* worker - background workers, for things like upgrade delivery and artifact scanning
* rtc - for all websocket facing communication

These apps will all depend on core, where most Plural business logic should live, and their releases are configured under `/rel`.

### Email Development

We use elixir's bamboo framework for templating and delivering emails, one benefit of which is it creates a local server to view in-progress emails.  You can get this set up by doing:

```bash
make core-migrate # ensure your dev db is set up
cd apps/email && iex -S mix phx.server
```

You should be able to view your emails at http://localhost:4002/sent_emails

You'll need to send an email to see them, which you can use the iex repl to do for you.

To actually write an email, you'll want to modify the templates in `apps/email/lib/email_web/templates/email` and the layout is in `apps/email/lib/email_web/templates/layout/email.html.eex`

## Adding a new application to the marketplace

See docs on our [docs site](https://docs.plural.sh/applications/adding-new-application) for how to add applications to the marketplace.

## Bug Bounty Program

Plural likes to work with the security community to find vulnerabilities in order to keep our businesses and customers safe.

As such, Plural has a Bug Bounty contributor program. Those interested in joining should reach out to support@plural.sh

### Program Rules
* Please provide detailed reports with reproducible steps. If the report is not detailed enough to reproduce the issue, the issue will not be eligible for a reward.
* Submit one vulnerability per report, unless you need to chain vulnerabilities to provide impact.
* When duplicates occur, we only award the first report that was received (provided that it can be fully reproduced).
* Multiple vulnerabilities caused by one underlying issue will be awarded one bounty.
* Social engineering (e.g. phishing, vishing, smishing) is prohibited.
* Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our service. Only interact with accounts you own or with explicit permission of the account holder.

### Out of scope vulnerabilities

When reporting vulnerabilities, please consider (1) attack scenario / exploitability, and (2) security impact of the bug. The following issues are considered out of scope:

* Clickjacking on pages with no sensitive actions
* Cross-Site Request Forgery (CSRF) on unauthenticated forms or forms with no sensitive actions
* Attacks requiring MITM or physical access to a user's device.
* Previously known vulnerable libraries without a working Proof of Concept.
* Any activity that could lead to the disruption of our service (DoS).
* Content spoofing and text injection issues without showing an attack vector/without being able to modify HTML/CSS
* Rate limiting or bruteforce issues on non-authentication endpoints
* Missing best practices in Content Security Policy.
* Missing HttpOnly or Secure flags on cookies
* Missing email best practices (Invalid, incomplete or missing SPF/DKIM/DMARC records, etc.)
* Vulnerabilities only affecting users of outdated or unpatched browsers [Less than 2 stable versions behind the latest released stable version]
* Software version disclosure / Banner identification issues / Descriptive error messages or headers (e.g. stack traces, application or server errors).
* Public Zero-day vulnerabilities that have had an official patch for less than 1 month will be awarded on a case by case basis.
* Tabnabbing
* Open redirect - unless an additional security impact can be demonstrated
* Issues that require unlikely user interaction
* Bugs that are already reported on any of Plural's issue trackers (https://github.com/pluralsh), or that we already know of. Note that some of our issue tracking is private.
* Test instances

### Safe Harbor

Any activities conducted in a manner consistent with this policy will be considered authorized conduct and we will not initiate legal action against you. If legal action is initiated by a third party against you in connection with activities conducted under this policy, we will take steps to make it known that your actions were conducted in compliance with this policy.

### Rewards
* Low: $60
* Medium: $125
* High: $250
* Critical: $750

### Rewards
Please submit to support@plural.sh to participate in bug bounty program 

