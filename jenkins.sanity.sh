#!/bin/bash -xe
echo "starting sanity test..."
export SEALIOUS_PORT=$PORT
SEALIOUS_BASE_URL=$(cat .base_url)
export SEALIOUS_BASE_URL

./npm.sh --no-TTY --user="$UID" run typecheck:front
./npm.sh --no-TTY --user="$UID" run typecheck:back

docker-compose run --user="$UID" \
	-e "SEALIOUS_MONGO_PORT=27017" \
	-e "SEALIOUS_MONGO_HOST=db" \
	-e "SEALIOUS_PORT=$SEALIOUS_PORT" \
	-e "SEALIOUS_BASE_URL=$SEALIOUS_BASE_URL" \
	-e "SEALIOUS_SANITY=true" \
	test
