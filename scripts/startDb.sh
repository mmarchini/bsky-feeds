#!/bin/bash

source .env
docker run --rm --name some-postgres \
  -e POSTGRES_DB=$FEEDGEN_DATABASE_NAME \
  -e POSTGRES_USER=$FEEDGEN_DATABASE_USER \
  -e POSTGRES_PASSWORD=$FEEDGEN_DATABASE_PASSWORD \
  -v ${FEEDGEN_DATABASE_VOLUME}:/var/lib/postgresql/data \
  -p ${FEEDGEN_DATABASE_PORT}:${FEEDGEN_DATABASE_PORT} \
  -d postgres:15.3
