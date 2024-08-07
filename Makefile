.PHONY: help

GCP_PROJECT ?= pluralsh
APP_NAME ?= plural
APP_VSN ?= `git describe`
BUILD ?= `git rev-parse --short HEAD`
DKR_HOST ?= dkr.plural.sh
dep ?= forge-core
GIT_COMMIT ?= abe123
TARGETARCH ?= amd64
COCKROACH_VSN ?= v24.1.3

help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
ifeq ($(APP_NAME), www)
	cd www && docker build -t $(APP_NAME):`cat ../VERSION` \
							-t $(APP_NAME):latest \
							-t gcr.io/$(GCP_PROJECT)/plural-www:`cat ../VERSION` \
							-t $(DKR_HOST)/plural/plural-www:`cat ../VERSION` .
else
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg GIT_COMMIT=$(GIT_COMMIT) \
		--build-arg TARGETARCH=$(TARGETARCH) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN) \
		-t $(DKR_HOST)/plural/$(APP_NAME):$(APP_VSN) .
endif

deploy: ## deploy artifacts to plural
	cd plural && plural apply

bump-version: ## bumps the image version of this chart
	plural utils image-bump plural/helm/plural --tag $(APP_VSN) --path "image.tag"

build-dump:
	cd dockerfiles && docker build -f Dockerfile.dump \
		-t gcr.io/$(GCP_PROJECT)/dumper:`cat ../VERSION` .
	docker push gcr.io/$(GCP_PROJECT)/dumper:$(APP_VSN)

push: ## push to gcr
ifeq ($(APP_NAME), www)
	docker push gcr.io/$(GCP_PROJECT)/plural-www:$(APP_VSN)
	docker push $(DKR_HOST)/plural/plural-www:$(APP_VSN)
else
	docker push gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN)
	docker push $(DKR_HOST)/plural/${APP_NAME}:$(APP_VSN)
endif

install-cockroach:
	sudo curl https://binaries.cockroachdb.com/cockroach-$(COCKROACH_VSN).linux-amd64.tgz | tar -xz && \
	sudo cp -i cockroach-$(COCKROACH_VSN).linux-amd64/cockroach /usr/local/bin/ && \
	sudo mkdir -p /usr/local/lib/cockroach && \
	sudo cp -i cockroach-$(COCKROACH_VSN).linux-amd64/lib/libgeos.so /usr/local/lib/cockroach/ && \
	sudo cp -i cockroach-$(COCKROACH_VSN).linux-amd64/lib/libgeos_c.so /usr/local/lib/cockroach/ && \
	cockroach version

setup-certs:
	mkdir test-certs && \
	cockroach cert create-ca --certs-dir test-certs --ca-key test-certs/ca.key && \
	cockroach cert create-node localhost 127.0.0.1 --certs-dir test-certs --ca-key test-certs/ca.key && \
	cockroach cert create-client root --certs-dir test-certs --ca-key test-certs/ca.key && \
	cockroach cert list --certs-dir test-certs

testup: setup-certs ## sets up dependent services for test
	docker compose up -d

testdown: ## tear down test dependencies
	docker compose down && \
	  rm -rf test-certs || echo 'no cert folder to remove'

connectdb: ## proxies the db in kubernetes via kubectl
	@echo "run psql -U forge -h 127.0.0.1 forge to connect"
	kubectl port-forward statefulset/forge-postgresql 5432 -n forge

setup: ## sets up your environment for testing
	mix do local.hex, local.rebar, deps.get
	cd www && yarn

web-install: ## install the web dependencies
	cd www && yarn install

web: ## starts a local webserver
	cd www && yarn start

check-updates: ## checks for new minor versions of node modules
	cd www && ncu -it minor && yarn

migration:
	cd apps/core && MIX_ENV=test mix ecto.gen.migration $(name)

yarn-add: ## adds a yarn dep to the react interface
	cd www && yarn add $(dep)

release-vsn: # tags and pushes a new release
	@read -p "Version: " tag; \
	git checkout master; \
	git pull --rebase; \
	git tag -a $$tag -m "new release"; \
	git push origin $$tag;

update-schema: ## updates gql schema
	MIX_ENV=test mix absinthe.schema.sdl --schema GraphQl  schema/schema.graphql
	cd www && yarn graphql:codegen

delete-tag:  ## deletes a tag from git locally and upstream
	@read -p "Version: " tag; \
	git tag -d $$tag; \
	git push origin :$$tag

core-setup: ## setup the backend database
	cd apps/core && mix ecto.setup

core-migrate: ## run the backend database migrations
	cd apps/core && mix ecto.create && mix ecto.migrate
