# Plural

## What is Plural?

A full lifecycle application control plane.

The plural platform ingests all deployment artifacts needed to deploy cloud-native applications and tracks their dependencies, allowing for seamless installations and no-touch upgrades post-install. All applications are managed via GitOps, allowing you to reconfigure them at will, or even eject them from Plural entirely.  It's your application, we just want to help you use it as easily as possible.

## The Plural Workflow

The workflow is literally two commands:

```bash
plural build
plural deploy
```

Our tooling will take care of the rest.

## Features

The Plural platform provides the following:

* Authenticated docker registry per repository
* Authenticated chartmuseum proxy for each repository
* secret encryption using AES-256 (so you can keep the entire workflow in git)
* dependency management between tf/helm modules, with dependency aware deployment in the cli
* dependency aware automatic upgrades
* billing management, with line item billing, usage limiting, and feature differentiation (core SaaS pricing constructs)
* OIDC provider to enable zero touch login security for all Plural applications
* DNS service to register fqdns under onplural.sh to eliminate the hassle of dns registration for users
* Security scanning of all docker images, helm charts, and terraform modules so you know exactly what you're installing
* Unified incident management, ensuring all Plural applications have a consistent, top-quality support experience.

## Documentation

* To get started with Plural see the [Getting Started guide](https://docs.plural.sh/getting-started)
* The full documentation is available on our [Documentation site](https://docs.plural.sh/)

## Community Support

For general help, please refer to the Plural documentation. For additional help you can use the following channels:

* [Discord](https://discord.gg/CKc2kfeXxQ) (For live discussions with the Plural team)
* [GitHub](https://github.com/pluralsh/plural/) (Bug reports, feature requests, contributions)
* [Twitter](https://twitter.com/plural_sh) (For our latest news)

## Get Swag

Swag coming soon!

## Development

Plural's server side is written in elixir, and exposes a graphql api. The frontend is in react, all code lives in this single repo and common development tasks can be done using the Makefile at the root of the repo.


### Developing Web
To begin developing the web app, install npm & yarn, then run:

```sh
cd assets && yarn install && cd -
make web
```

### Developing Server

To make changes to the server codebase, you'll want to install elixir on your machine.  For mac desktops, we do this via asdf, which can be done simply at the root of the repo like so:

```sh
asdf install
```

Once elixir is available, all server dependencies are managed via docker-compose, and tests can be run via `mix`, like so:

```sh
make testup
mix test
```

### Server Architecture

The Plural server codebase uses an elixir umbrella application to organize itself, and splits into three main deployments: 

* api - hosting the main graphql api
* worker - background workers, for things like upgrade delivery and artifact scanning
* rtc - for all websocket facing communication

These apps will all depend on core, where most Plural business logic should live, and their releases are configured under `/rel`.

## Contributing
Details on contributing coming soon!

## License
See [LICENSE](LICENSE) for licensing information.
