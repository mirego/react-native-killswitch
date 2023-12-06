# Build configuration
# -------------------

APP_NAME = `grep -m1 name package.json | awk -F: '{ print $$2 }' | sed 's/[ ",]//g'`
APP_VERSION = `grep -m1 version package.json | awk -F: '{ print $$2 }' | sed 's/[ ",]//g'`
GIT_REVISION = `git rev-parse HEAD`

# Linter and formatter configuration
# ----------------------------------

PRETTIER_FILES_PATTERN = '{src,example}/**/*.{js,ts,tsx,svg,json}' '**/*.md'
SCRIPTS_PATTERN = '{src,example}/**/*.{js,ts,tsx}'

# Introspection targets
# ---------------------

.PHONY: help
help: header targets

.PHONY: header
header:
	@echo "\033[34mEnvironment\033[0m"
	@echo "\033[34m---------------------------------------------------------------\033[0m"
	@printf "\033[33m%-23s\033[0m" "APP_NAME"
	@printf "\033[35m%s\033[0m" $(APP_NAME)
	@echo ""
	@printf "\033[33m%-23s\033[0m" "APP_VERSION"
	@printf "\033[35m%s\033[0m" $(APP_VERSION)
	@echo ""
	@printf "\033[33m%-23s\033[0m" "GIT_REVISION"
	@printf "\033[35m%s\033[0m" $(GIT_REVISION)
	@echo "\n"

.PHONY: targets
targets:
	@echo "\033[34mTargets\033[0m"
	@echo "\033[34m---------------------------------------------------------------\033[0m"
	@perl -nle'print $& if m{^[a-zA-Z_-\d]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

# Development targets
# -------------------

.PHONY: dependencies
dependencies: ## Install dependencies required by the application
	- yarn install
	- yarn --cwd example install

.PHONY: ci-dependencies
ci-dependencies: ## Install dependencies required by the application in CI
	yarn install --frozen-lockfile

.PHONY: ci-test
ci-test: ## Run the test suite in CI
	CI=true yarn test --forceExit --detectOpenHandles

.PHONY: test
test: ## Run the test suite
	yarn test --forceExit --detectOpenHandles

.PHONY: start-example
start-example: ## Run the test suite
	yarn --cwd example start

# Check, lint and format targets
# ------------------------------

.PHONY: check
check: check-format lint

.PHONY: check-all
check-all: check-format lint check-types

.PHONY: check-format
check-format:
	yarn prettier --check $(PRETTIER_FILES_PATTERN)

.PHONY: check-types
check-types:
	yarn tsc --noEmit

.PHONY: format
format: ## Format project files
	- yarn prettier --write $(PRETTIER_FILES_PATTERN)
	- yarn eslint --fix $(SCRIPTS_PATTERN)

.PHONY: lint
lint: ## Lint project files
	yarn eslint --max-warnings 0 $(SCRIPTS_PATTERN)

# Release
# ------------------------------
.PHONY: version
version:
	- yarn version

.PHONY: release
release:
	- yarn run release-it
