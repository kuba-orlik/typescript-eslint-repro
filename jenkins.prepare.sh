#!/bin/bash

set -e

docker-compose down

cp secrets.example.json secrets.json


export SEALIOUS_PORT=$PORT
SEALIOUS_BASE_URL=$(cat .base_url)
export SEALIOUS_BASE_URL

docker-compose up -d db
./npm.sh ci
./npm.sh run build:back;

rm -f log.html
