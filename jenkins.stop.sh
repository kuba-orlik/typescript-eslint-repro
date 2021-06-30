#!/bin/bash

export SEALIOUS_PORT="${PORT}0"
SEALIOUS_BASE_URL=$(cat .base_url)
export SEALIOUS_BASE_URL

docker-compose down --volumes
rm -rf node_modules

