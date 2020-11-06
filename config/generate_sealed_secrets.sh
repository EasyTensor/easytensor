#! /usr/bin/env bash

# Get unsealed secret. Place all of them in /k8s/prod
# ./config/generate_prod_secrets.sh

# Declare a string array with type
declare -a StringArray=("django-secret" "jwt-secret")
 
# Seal the secret files
for val in "${StringArray[@]}"; do
    kubectl create secret generic "$val" --from-file=k8s/prod/secrets/"$val" -o yaml --dry-run=client -n prod >"$val".yaml
    kubeseal -o yaml <"$val".yaml >k8s/prod/secrets/sealed-"$val".yaml
    rm "$val".yaml
done

#special case: database properties

kubectl create secret generic database-properties \
  --from-file=DATABASE_NAME=k8s/prod/secrets/database-name-secret \
  --from-file=DATABASE_USER=k8s/prod/secrets/database-user-secret \
  --from-file=DATABASE_PASSWORD=k8s/prod/secrets/database-password-secret \
  --from-literal=DATABASE_HOST=localhost \
  --from-literal=DATABASE_PORT=5432 \
  -o yaml --dry-run=client -n prod > database-secret.yaml
kubeseal -o yaml <database-secret.yaml >k8s/prod/secrets/sealed-database-secret.yaml
rm database-secret.yaml
