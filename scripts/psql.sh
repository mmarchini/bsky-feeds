#!/bin/bash

set -e

source .env
# psql -u
docker run -it --rm -e PGPASSWORD=$FEEDGEN_DATABASE_PASSWORD \
  --link some-postgres:some-postgres \
  postgres:15.3 psql --user $FEEDGEN_DATABASE_USER \
  --dbname $FEEDGEN_DATABASE_NAME \
  --host some-postgres \
  --port $FEEDGEN_DATABASE_PORT
# docker run --name some-postgres \
#   -e POSTGRES_DB=$FEEDGEN_DATABASE_NAME \
#   -e POSTGRES_USER= \
#   -e POSTGRES_PASSWORD= \
#   -v ${FEEDGEN_DATABASE_VOLUME}:/var/lib/postgresql/data \
#   -p ${FEEDGEN_DATABASE_PORT}:${FEEDGEN_DATABASE_PORT} \
#   -d postgres:15.3

