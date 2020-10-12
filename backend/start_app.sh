python manage.py makemigrations
python manage.py migrate
DJANGO_SUPERUSER_PASSWORD=dev python manage.py createsuperuser --username admin --email dev@easytensor.com --noinput
python manage.py runserver