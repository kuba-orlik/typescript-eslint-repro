#!/bin/bash

export SEALIOUS_PORT=$PORT
SEALIOUS_BASE_URL=$(cat .base_url)
export SEALIOUS_BASE_URL

./npm.sh run build:front;

docker-compose run --user="$UID"\
			   -e "SEALIOUS_MONGO_PORT=27017" \
			   -e "SEALIOUS_MONGO_HOST=db" \
			   -e "SEALIOUS_PORT=$SEALIOUS_PORT" \
			   -e "SEALIOUS_BASE_URL=$SEALIOUS_BASE_URL" \
			   -p "${SEALIOUS_PORT}:${SEALIOUS_PORT}" \
			   -d \
			   test \
			   /bin/sh -c "{ node . --color  2>&1; } | ./node_modules/.bin/ansi-html-stream > log.html" \
	&& echo "App started on $SEALIOUS_PORT"


echo "Deployed to https://${PORT}.dep.sealco.de"
echo "Application logs should be available at https://jenkins.sealcode.org/job/Deploy%20to%20dep.sealco.de/ws v2/$PORT/log.html"
