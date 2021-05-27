#!/usr/bin/env bash

docker-compose run --user="$UID" --rm --service-ports test npm --loglevel warn "$@"
