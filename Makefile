.PHONY: help

GCP_PROJECT ?= piazzaapp
APP_NAME ?= chartmart
APP_VSN ?= `cat VERSION`
BUILD ?= `git rev-parse --short HEAD`

help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the Docker image
ifeq ($(APP_NAME), www)
	cd www && docker build -t $(APP_NAME):`cat ../VERSION` \
							-t $(APP_NAME):latest \
							-t gcr.io/$(GCP_PROJECT)/chartmart_www:`cat ../VERSION` .
else
	docker build --build-arg APP_NAME=$(APP_NAME) \
		--build-arg APP_VSN=$(APP_VSN) \
		-t $(APP_NAME):$(APP_VSN) \
		-t $(APP_NAME):latest \
		-t gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN) .
endif

push: ## push to gcr
	docker push gcr.io/$(GCP_PROJECT)/$(APP_NAME):$(APP_VSN)

testup: ## sets up dependent services for test
	docker-compose up -d


connectdb: ## proxies the db in kubernetes via kubectl
	@echo "run psql -U chartmart -h 127.0.0.1 chartmart to connect"
	kubectl port-forward statefulset/chartmart-postgresql 5432 -n chartmart

install: ## installs the helm chart
	helm upgrade --install -f charts/chartmart/config.secrets.yaml --namespace chartmart chartmart charts/chartmart

web: ## starts a local webserver
	cd www && npm start

cli: ## builds the chartmart cli
	cd cmd && go build