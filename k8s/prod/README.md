# Secrets
The production configuration requires secretes that are different from the development environment.
These secrets are kept in a SealedSecret configuration using [bitnami's Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets).

These secrets are generated via the `./config/generate_sealed_secret.sh` script. To correctly genreate and update these secrets you must:
- Have access to the gcloud secret manager service
- Have the kubernetes context be set to the production environment. (*This is vital*).

The secrets are sealed using the active kuberentes environment. It is very important to ensure that you only change the production secrets when you're in the context of the production cluster. The secrets are asymetrical, so once they're sealed, only the cluster controller can unseal them.
