# create django backend key
ssh-keygen -t rsa -b 4096 -m RFC4716 -f k8s/base/django-secret -N kamalkamal
ssh-keygen -t rsa -b 4096 -m RFC4716 -f k8s/base/jwt-secret -N kamalkamal
