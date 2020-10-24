# create django backend key
echo $(pwd)
ssh-keygen -t rsa -b 4096 -m RFC4716 -f k8s/dev/django-secret -N kamalkamal
ssh-keygen -t rsa -b 4096 -m RFC4716 -f k8s/dev/jwt-secret -N kamalkamal