#!/bin/sh

pg_dump --dbname=postgresql://${SOURCE_USER}:${SOURCE_PASSWORD}@${SOURCE_HOST}:5432/${SOURCE_DB} | \
  psql postgresql://${DEST_USER}:${DEST_PASSWORD}@${DEST_HOST}:5432/${DEST_DB}?sslmode=allow