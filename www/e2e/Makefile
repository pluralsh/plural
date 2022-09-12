ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
DOCKERFILE := $(ROOT_DIRECTORY)/cypress.Dockerfile
IMAGE_NAME := plural-e2e
IMAGE_REPOSITORY := ""

.PHONY: build
build:
	docker build -t $(IMAGE_NAME) -f $(DOCKERFILE) .

.PHONY: kind
kind: build
	kind load docker-image $(IMAGE_NAME)

.PHONY: push
push:
	docker image tag $(IMAGE_NAME) $(IMAGE_REPOSITORY)/$(IMAGE_NAME)
	docker push $(IMAGE_REPOSITORY)/$(IMAGE_NAME)
