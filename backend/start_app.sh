#! /usr/bin/env bash
set -e 

./wait-for-django-db.sh

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py loaddata fixtures.json

if [[ "$DEPLOYMENT_ENV" == "DEV" ]]; then
    DJANGO_SUPERUSER_PASSWORD=dev python3 manage.py createsuperuser --username admin --email dev@easytensor.com --noinput || echo "admin user already exists"
fi
python3 manage.py runserver 0.0.0.0:8000
