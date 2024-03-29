# Version info for binaries
GIT_REVISION := $(shell git rev-parse --short HEAD)

DOCKER_REPO ?= opstrace
# DOCKER_IMAGE_TAG is a shasum of all the files (except hidden) in the go
# directory. We use it to have a deterministic method to calculate a docker
# image tag.
DOCKER_IMAGE_TAG ?= $(shell find . -type f -not -name ".*" -print0 | sort -z -d -f | xargs -0 cat | shasum | cut -d' ' -f1)

DOCKERFILE = ./Dockerfile

all: build-image publish

export GO111MODULE=on
export GOPRIVATE=github.com/opstrace

.PHONY: clean
clean: clean-config clean-cortex clean-ddapi clean-loki

.PHONY: clean-config
clean-config:
	rm -f config-api

.PHONY: clean-cortex
clean-cortex:
	rm -f cortex-api

.PHONY: clean-ddapi
clean-ddapi:
	rm -f ddapi

.PHONY: clean-loki
clean-loki:
	rm -f loki-api

.PHONY: clean-tracing
clean-tracing:
	rm -f tracing-api

.PHONY: build-image
build-image: build-image-config build-image-cortex build-image-ddapi build-image-loki build-image-tracing

define get_docker_image_name
	$(DOCKER_REPO)/$(DOCKER_IMAGE_NAME):$(DOCKER_IMAGE_TAG)
endef

.PHONY: print-docker-image-name-tag
print-docker-image-name-tag:
	@echo $(call get_docker_image_name)

# Function to build a docker image. Parameters are passed via
# Makefile variables.
define build_docker_image
	docker build -f $(DOCKERFILE) . -t $(call get_docker_image_name)
endef

.PHONY: build-image-config
build-image-config: DOCKERFILE = Dockerfile.config
build-image-config: DOCKER_IMAGE_NAME = config-api
build-image-config:
	$(call build_docker_image)

.PHONY: build-image-cortex
build-image-cortex: DOCKERFILE = Dockerfile.cortex
build-image-cortex: DOCKER_IMAGE_NAME = cortex-api
build-image-cortex:
	$(call build_docker_image)

.PHONY: build-image-ddapi
build-image-ddapi: DOCKERFILE = Dockerfile.ddapi
build-image-ddapi: DOCKER_IMAGE_NAME = ddapi
build-image-ddapi:
	$(call build_docker_image)

.PHONY: build-image-loki
build-image-loki: DOCKERFILE = Dockerfile.loki
build-image-loki: DOCKER_IMAGE_NAME = loki-api
build-image-loki:
	$(call build_docker_image)

.PHONY: build-image-tracing
build-image-tracing: DOCKERFILE = Dockerfile.tracing
build-image-tracing: DOCKER_IMAGE_NAME = tracing-api
build-image-tracing:
	$(call build_docker_image)

.PHONY: publish
publish: publish-config publish-cortex publish-ddapi publish-loki publish-tracing

define publish_docker_image
	docker push $(call get_docker_image_name)
endef

.PHONY: publish-config
publish-config: DOCKER_IMAGE_NAME = config-api
publish-config:
	$(call publish_docker_image)

.PHONY: publish-cortex
publish-cortex: DOCKER_IMAGE_NAME = cortex-api
publish-cortex:
	$(call publish_docker_image)

.PHONY: publish-ddapi
publish-ddapi: DOCKER_IMAGE_NAME = ddapi
publish-ddapi:
	$(call publish_docker_image)

.PHONY: publish-loki
publish-loki: DOCKER_IMAGE_NAME = loki-api
publish-loki:
	$(call publish_docker_image)

.PHONY: publish-tracing
publish-tracing: DOCKER_IMAGE_NAME = tracing-api
publish-tracing:
	$(call publish_docker_image)

.PHONY: build
build: build-config build-cortex build-ddapi build-loki build-tracing

.PHONY: build-config
build-config: config-api

config-api:
	go build -o config-api ./cmd/config/

.PHONY: build-cortex
build-cortex: cortex-api

cortex-api:
	go build -o cortex-api ./cmd/cortex/

.PHONY: build-ddapi
build-ddapi: ddapi

ddapi:
	go build -o ddapi ./cmd/ddapi/

.PHONY: build-loki
build-loki: loki-api

loki-api:
	go build -o loki-api ./cmd/loki/

.PHONY: build-tracing
build-tracing: tracing-api

tracing-api:
	go build -o tracing-api ./cmd/tracing/


.PHONY: unit-tests
unit-tests:
	# These tests need access to a Docker daemon: they use the library
	# `testcontainers-go`) to manage Docker container(s). If this target
	# is executed in a Docker container, then that Docker container needs to
	# have /var/run/docker.sock mounted into the container (from the host),
	# and should be started in host networking mode (at least that's what's
	# known to work).
	#docker info
	go test -v ./...


