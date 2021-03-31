### get backend secrets
set -e
gcloud secrets versions access 1 --secret="ET_PROD_DJANGO_SECRET" > k8s/prod/secrets/django-secret
gcloud secrets versions access 1 --secret="ET_PROD_JWT_SECRET" > k8s/prod/secrets/jwt-secret
gcloud secrets versions access 2 --secret="ET_PROD_DATABASE_NAME" > k8s/prod/secrets/database-name-secret
gcloud secrets versions access 1 --secret="ET_PROD_DATABASE_USER" > k8s/prod/secrets/database-user-secret
gcloud secrets versions access 1 --secret="ET_PROD_DATABASE_PASSWORD" > k8s/prod/secrets/database-password-secret

gcloud secrets versions access 1 --secret="SMTP_EMAIL_SERVER" > k8s/prod/secrets/email-server-secret
gcloud secrets versions access 1 --secret="SMTP_EMAIL_PORT" > k8s/prod/secrets/email-port-secret
gcloud secrets versions access 1 --secret="SMTP_EMAIL_USER" > k8s/prod/secrets/email-user-secret
gcloud secrets versions access 1 --secret="SMTP_EMAIL_PASSWORD" > k8s/prod/secrets/email-password-secret

gcloud secrets versions access 1 --secret="ET_PROD_STRIPE_SECRET_KEY" > k8s/prod/secrets/stripe-secret
