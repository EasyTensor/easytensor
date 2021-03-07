
#### Setup

##### Requirements
- [Docker] (https://www.docker.com/get-started)
- [minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Skaffold](https://skaffold.dev/)
- [kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/) (an old version ships with kubectl)
- google service account key. Ask an admin to create one for you.
- [Google SDK](https://cloud.google.com/sdk/docs/install) (Optional, for accessing prod)

##### Start dev process
1. Start the docker daemon
2. Start a minikube cluster (`minikube start --memory="5g"`)
3. Use the minikube docker environment (`eval $(minikube docker-env)`)
4. Start the skaffold dev process (`make dev`)

##### Secrets
You will need to initialize some secrets for local development
- run `make gen-secrets`. This will place most of the necessary secrets in /k8s/base/
- You will need to google SA secret to be put in k8s/base/google-SA-secret.txt

##### Deleting the database
```shell
skaffold delete # Destroys the cluster
minikube ssh # Enters the minikube docker conatiner
sudo rm -rf /mnt/data # make sure this is running inside the minikube node
exit # exits the minikube node
make dev # or whatever command you start the stack with
```

##### Adding migrations
When the SQL schema changes, you will need to run this set of commands. This will ensure that the SQL schema is updated before the new application code runs.
```shell
kubectl exec "$(kubectl get po | grep backend | awk '{print $1}')" -- python3 /app/manage.py makemigrations
kubectl cp "$(kubectl get po | grep backend | awk '{print $1}')":/app/uploads/migrations backend/uploads/migrations
```


##### Authenticating to prod cluster
- `gcloud init` to login to the GCP console
- `gcloud container clusters list` to list the clusters
- `gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION` to get k8s auth