.PHONY: help

GCP_PROJECT ?= piazzaapp
APP_NAME ?= forge
APP_VSN ?= `cat VERSION`
BUILD ?= `git rev-parse --short HEAD`

help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
ifeq ($(APP_NAME), www)
	cd www && docker build -t $(APP_NAME):`cat ../VERSION` \
							-t $(APP_NAME):latest \
							-t gcr.io/$(GCP_PROJECT)/forge-www:`cat ../VERSION` \
							-t dkr.piazzaapp.com/forge/forge-www:`cat ../VERSION` .
else ifeq ($(APP_NAME), watchman)
	cp apps/watchman/Dockerfile Dockerfile.temp
	docker build --build-arg APP_NAME=$(APP_NAME) -f Dockerfile.temp \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN) \
		-t dkr.piazzaapp.com/forge/$(APP_NAME):$(APP_VSN) .
	rm Dockerfile.temp
else
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN) \
		-t dkr.piazzaapp.com/forge/$(APP_NAME):$(APP_VSN) .
endif

push: ## push to gcr
	docker push gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN)
	docker push dkr.piazzaapp.com/forge/${APP_NAME}:${APP_VSN}

testup: ## sets up dependent services for test
	docker-compose up -d

testdown: ## tear down test dependencies
	docker-compose down

connectdb: ## proxies the db in kubernetes via kubectl
	@echo "run psql -U forge -h 127.0.0.1 forge to connect"
	kubectl port-forward statefulset/forge-postgresql 5432 -n forge

install: ## installs the helm chart
	helm upgrade --install -f charts/forge/config.secrets.yaml --namespace forge forge charts/forge

web: ## starts a local webserver
	cd www && npm start

cli: ## builds the forge cli
	cd cmd && go build