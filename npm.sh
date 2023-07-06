#!/usr/bin/env -S bash -x


# the "--no-TTY" option is crucial - without it the output is not captured in Jenkins

docker-compose run \
			   --rm \
			   --service-ports \
	   	   	-e "SEALIOUS_MONGO_PORT=27017" \
           	-e "SEALIOUS_MONGO_HOST=db" \
			   test \
			   npm "$@"
