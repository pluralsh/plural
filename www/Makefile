.PHONY: help up-docker test-docker build-docker

help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up-docker: ## build and serve frontend via docker compose
	docker compose -f docker-compose.yml up --build

test-docker: ## run frontend tests in docker
	@docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from frontend-test; \
	status=$$?; \
	docker compose -f docker-compose.test.yml down; \
	exit $$status

build-docker: ## build frontend docker image via compose
	docker compose -f docker-compose.yml build
