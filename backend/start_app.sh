#! /usr/bin/env bash
set -e

./wait-for-django-db.sh
./wait-for-migrations.sh

python3 manage.py runserver 0.0.0.0:8000
