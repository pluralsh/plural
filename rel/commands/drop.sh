#!/bin/sh

release_ctl eval --mfa "Piazza.Ecto.ReleaseTasks.drop/1" --argv -- "$@"
