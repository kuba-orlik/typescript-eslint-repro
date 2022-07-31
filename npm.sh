#!/usr/bin/env -S bash -x


# the "--no-TTY" option is crucial - without it the output is not captured in Jenkins

docker-compose run \
			   --no-TTY \
			   --user="$UID" \
			   --rm \
			   --service-ports \
			   test \
			   npm "$@"
