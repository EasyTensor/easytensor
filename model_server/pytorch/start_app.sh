#! /usr/bin/env bash
# A script to start the pytorch model server

set -e

./wait_for_model.sh

uvicorn main:app --reload --host '0.0.0.0' --port 8090