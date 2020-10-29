python3 manage.py makemigrations
python3 manage.py migrate
DJANGO_SUPERUSER_PASSWORD=dev python3 manage.py createsuperuser --username admin --email dev@easytensor.com --noinput
python3 manage.py runserver 0.0.0.0:8000
