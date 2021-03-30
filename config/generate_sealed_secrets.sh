#! /usr/bin/env bash
set -e 
# Get unsealed secret. Place all of them in /k8s/prod
./config/generate_prod_secrets.sh

# Declare a string array with type
declare -a StringArray=("django-secret" "jwt-secret")
 
# Seal the secret files
for val in "${StringArray[@]}"; do
    kubectl create secret generic "$val" --from-file=k8s/prod/secrets/"$val" -o yaml --dry-run=client -n prod >"$val".yaml
    kubeseal -o yaml <"$val".yaml >k8s/prod/secrets/sealed-"$val".yaml
    rm "$val".yaml
done

# databaseproperties
kubectl create secret generic database-properties \
  --from-file=DATABASE_NAME=k8s/prod/secrets/database-name-secret \
  --from-file=DATABASE_USER=k8s/prod/secrets/database-user-secret \
  --from-file=DATABASE_PASSWORD=k8s/prod/secrets/database-password-secret \
  --from-literal=DATABASE_HOST=localhost \
  --from-literal=DATABASE_PORT=5432 \
  -o yaml --dry-run=client -n prod > database-secret.yaml
kubeseal -o yaml <database-secret.yaml >k8s/prod/secrets/sealed-database-secret.yaml
rm database-secret.yaml


# Email properties
kubectl create secret generic email-properties \
  --from-file=EMAIL_SERVER=k8s/prod/secrets/email-server-secret \
  --from-file=EMAIL_PORT=k8s/prod/secrets/email-port-secret \
  --from-file=EMAIL_USER=k8s/prod/secrets/email-user-secret \
  --from-file=EMAIL_PASSWORD=k8s/prod/secrets/email-password-secret \
  -o yaml --dry-run=client -n prod > email-secret.yaml
kubeseal -o yaml <email-secret.yaml >k8s/prod/secrets/sealed-email-secret.yaml
rm email-secret.yaml

# Assumes google-SA-secret.txt has been downloaded to k8s/dev/google-SA-secret.txt
GOOGLE_SECRET_FILE="k8s/dev/google-SA-secret.txt"
if [ ! -f "${GOOGLE_SECRET_FILE}" ]; then
  echo "FAIL: Could not file file $GOOGLE_SECRET_FILE"
  exit 1
fi

kubectl create secret generic google-sa-secret --from-file="${GOOGLE_SECRET_FILE}" -o yaml --dry-run=client -n prod > google-SA-secret.yaml
kubeseal -o yaml <google-SA-secret.yaml >k8s/prod/secrets/sealed-google-SA-secret.yaml
rm google-SA-secret.yaml
