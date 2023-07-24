.PHONY: help

help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## installs dependencies
	pip3 install -r requirements.txt

serve: ## starts the server
	uvicorn main:app --reload

scrape: ## attempts to compile a local graph store from various datasources
	python3 scraper.py