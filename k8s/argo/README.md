# Basic Auth Setup
Argo workflow does not come with authentication out of the box so you'll have to follow [this guide](https://kubernetes.github.io/ingress-nginx/examples/auth/basic/) to get basic auth set up.

The basic auth credentials are already part of the `argo-ingress.yaml` file.
```
nginx.ingress.kubernetes.io/auth-type: basic
nginx.ingress.kubernetes.io/auth-secret: basic-auth
nginx.ingress.kubernetes.io/auth-realm: 'Authentication Required - Argo'
```