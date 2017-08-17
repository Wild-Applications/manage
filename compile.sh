docker build -t wildapps/manage:0.0.1 . &&
kubectl scale --replicas=0 deployment deployment --namespace=manage &&
kubectl scale --replicas=2 deployment deployment --namespace=manage
