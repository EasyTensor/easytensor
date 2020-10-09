kubectl create clusterrolebinding cluster-admin-binding --clusterrole=cluster-admin --user="$(gcloud config get-value account)"

kubectl create namespace argo
kubectl apply -n argo -f argo.yaml
kubectl apply -n argo -f argo-ingress.yaml