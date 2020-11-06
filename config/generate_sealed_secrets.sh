#! /usr/bin/env bash
./config/generate_prod_secrets.sh
kubectl create secret generic django-secret --from-file=k8s/prod/django-secret -o yaml --dry-run=client -n prod >django-secret.yaml
kubeseal -o yaml <django-secret.yaml >k8s/prod/sealed-django-secret.yaml
rm django-secret.yaml

kubectl create secret generic jwt-secret --from-file=k8s/prod/jwt-secret -o yaml --dry-run=client -n prod >jwt-secret.yaml
kubeseal -o yaml <jwt-secret.yaml >k8s/prod/sealed-jwt-secret.yaml
rm jwt-secret.yaml
