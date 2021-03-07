#! /usr/bin/env bash
set -e

./wait-for-django-db.sh

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py loaddata fixtures.json

if [[ "$DEPLOYMENT_ENV" == "DEV" ]]; then
    # Create admin user for inspecting
    DJANGO_SUPERUSER_PASSWORD=dev python3 manage.py createsuperuser --username admin --email dev@easytensor.com --noinput || echo "admin user already exists"
    python3 manage.py loaddata dev_fixtures.json
fi

python3 manage.py shell <setup_fixtures.py

echo "Finished migrating. Sleeping."
sleep infinity