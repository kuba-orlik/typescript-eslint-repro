#!/bin/bash

docker-compose down

set -e

export SEALIOUS_PORT=$1
export SEALIOUS_BASE_URL=$2

docker-compose down
docker-compose up -d db
./npm.sh ci
./npm.sh run build:back;
./npm.sh run build:front;

rm -f log.txt

docker-compose run --user="$UID"\
			   -e "SEALIOUS_MONGO_PORT=27017" \
			   -e "SEALIOUS_MONGO_HOST=db" \
			   -e "SEALIOUS_PORT=$SEALIOUS_PORT" \
			   -e "SEALIOUS_BASE_URL=$SEALIOUS_BASE_URL" \
			   -p ${SEALIOUS_PORT}:${SEALIOUS_PORT} \
			   -d \
			   test \
			   /bin/sh -c "node . 2>&1 | ansi2html > log.html" \
	&& echo "App started on $SEALIOUS_PORT"
