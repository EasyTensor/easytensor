### get backend secrets
echo $(gcloud secrets versions access 1 --secret="ET_PROD_DJANGO_SECRET") > k8s/prod/secrets/django-secret
echo $(gcloud secrets versions access 1 --secret="ET_PROD_JWT_SECRET") > k8s/prod/secrets/jwt-secret
echo $(gcloud secrets versions access 2 --secret="ET_PROD_DATABASE_NAME") > k8s/prod/secrets/database-name-secret
echo $(gcloud secrets versions access 1 --secret="ET_PROD_DATABASE_USER") > k8s/prod/secrets/database-user-secret
echo $(gcloud secrets versions access 1 --secret="ET_PROD_DATABASE_PASSWORD") > k8s/prod/secrets/database-password-secret
