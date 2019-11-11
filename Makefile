APP_NAME = emergency-console
SERVER = quay.io
ORG = emergencyresponsedemo
RELEASE_TAG ?= $(CIRCLE_TAG)
CONTAINER_LATEST_TAG = ${SERVER}/${ORG}/$(APP_NAME):latest
CONTAINER_MASTER_TAG = ${SERVER}/${ORG}/$(APP_NAME):master
CONTAINER_RELEASE_TAG = ${SERVER}/${ORG}/$(APP_NAME):$(RELEASE_TAG)

.PHONY: container_build_latest
container_build_latest:
				docker build -t $(CONTAINER_LATEST_TAG) .

.PHONY: container_push_latest
container_push_latest:
				@docker login -u $(QUAY_USERNAME) -p "$(QUAY_PASSWORD)" ${SERVER}
				docker push $(CONTAINER_LATEST_TAG)

.PHONY: container_build_release
container_build_release:
				docker build -t $(CONTAINER_RELEASE_TAG) .

.PHONY: container_push_release
container_push_release:
				@docker login -u $(QUAY_USERNAME) -p $(QUAY_PASSWORD) ${SERVER}
				docker push $(CONTAINER_RELEASE_TAG)

.PHONY: container_build_master
container_build_master:
				docker build -t $(CONTAINER_MASTER_TAG) .

.PHONY: container_push_master
container_push_master:
				@docker login -u $(QUAY_USERNAME) -p $(QUAY_PASSWORD) ${SERVER}
				docker push $(CONTAINER_MASTER_TAG)