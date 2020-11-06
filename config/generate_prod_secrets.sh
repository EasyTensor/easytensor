#! /bin/bash
cat > k8s/prod/backend.properties.secret <<EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=$(gcloud secrets versions access 2 --secret="ET_PROD_DATABASE_NAME")
DATABASE_USER=$(gcloud secrets versions access 1 --secret="ET_PROD_DATABASE_USER")
DATABASE_PASSWORD=$(gcloud secrets versions access 1 --secret="ET_PROD_DATABASE_PASSWORD")
EOF

### get backend secrets
echo $(gcloud secrets versions access 1 --secret="ET_PROD_DJANGO_SECRET") > k8s/prod/django-secret
echo $(gcloud secrets versions access 1 --secret="ET_PROD_JWT_SECRET") > k8s/prod/jwt-secret