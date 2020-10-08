kubectl create clusterrolebinding cluster-admin-binding --clusterrole=cluster-admin --user="$(gcloud config get-value account)"

kubectl create namespace argocd
kubectl apply -n argocd -f argocd.yaml
kubectl apply -n argocd -f argocd-ingress.yaml
