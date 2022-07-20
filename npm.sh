#!/usr/bin/env -S bash -x


# the "--no-TTY" option is crucial - without it the output is not captured in Jenkins

docker-compose run \
			   --no-TTY \
			   --user="$UID" \
			   --rm \
			   --service-ports \
			   -e BASELINE_DATABASE="baseline" \
			   -e "BASELINE_PORT=1433" \
			   test \
			   npm --loglevel warn "$@"
