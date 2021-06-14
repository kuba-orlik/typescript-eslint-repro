#!/bin/bash

set -e

docker-compose down

cp secrets.example.json secrets.json


export SEALIOUS_PORT=$PORT
SEALIOUS_BASE_URL=$(cat .base_url)
export SEALIOUS_BASE_URL

# Create the npm cache directory if it isn't present yet. If it is not present, it will be created
# when the docker image is being built with root:root as the owner.
mkdir -p ~/.npm_cacache
# Create .npm directory in the container, since it is not yet present and we need it for next step.
docker-compose run --user="$UID" --rm --service-ports test mkdir -p /opt/sealious/.npm
# Link the host-bound npm cache directory into the container's npm cache directory.
docker-compose run --user="$UID" --rm --service-ports test ln -s /opt/sealious/.npm_cacache /opt/sealious/.npm/_cacache
docker-compose up -d db
./npm.sh ci
./npm.sh run build:back;

rm -f log.html
