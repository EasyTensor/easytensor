
#### Setup
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
