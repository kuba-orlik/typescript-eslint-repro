#!/bin/bash -xe
set -e

docker-compose down

npm install @sealcode/sealgen
npx sealgen make-env
cp secrets.example.json secrets.json

export SEALIOUS_PORT="${PORT}0"
SEALIOUS_BASE_URL=$(cat .base_url)
export SEALIOUS_BASE_URL
echo "PORT=$PORT" >> .env

mkdir -p node_modules
mkdir -p docker_node_modules

# https://github.com/docker/compose/issues/4725
docker-compose build

docker-compose up -d db
./npm.sh --no-TTY  ci && ./npm.sh --no-TTY run build

rm -f log.html
