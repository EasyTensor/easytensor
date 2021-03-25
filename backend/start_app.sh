#! /usr/bin/env bash
set -e

./wait_for_django_db.sh
./wait_for_migrations.sh

python3 manage.py runserver 0.0.0.0:8000
