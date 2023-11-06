#!/usr/bin/env -S bash -x

# the "--no-TTY" option is crucial - without it the output is not captured in Jenkins

CONTAINER_ID=$(docker-compose run \
	-d \
	--service-ports \
	-e "SEALIOUS_MONGO_PORT=27017" \
	-e "SEALIOUS_MONGO_HOST=db" \
	test \
	npm "$@")

docker logs -f $CONTAINER_ID
docker rm $CONTAINER_ID
