# Secrets
The production configuration requires secretes that are different from the development environment.
These secrets are kept in a SealedSecret configuration using [bitnami's Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets).

##### Retrieve un-sealed credentials
Before you can seal the credentials, you first need to retrieve them. A list of the credentials you will need to retrieve:
- Google Service Account: This is a json file that you will have to retrieve manually from the google IAM page.
- JWT and Django secrets: These are stored in google KMS and are automatically retrieved by the key sealer script below. If you want to download them separately, they can be downloaded via `./config/generate_prod_secrets.sh`.

##### Sealing the credentials

These secrets are generated via the `./config/generate_sealed_secret.sh` script. To correctly genreate and update these secrets you must:
- Have access to the gcloud secret manager service
- Have the kubernetes context be set to the production environment. (*This is vital*).

The secrets are sealed using the active kuberentes environment. It is very important to ensure that you only change the production secrets when you're in the context of the production cluster. The secrets are asymetrical, so once they're sealed, only the cluster controller can unseal them.
