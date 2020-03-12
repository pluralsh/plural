# Kubernetes Bootstrapping

Creates the following dependent resources for a forge installation:

* buckets for assets/charts
* iam policies/service accounts to grant access to the buckets
* kube namespace for the installation
* secrets with creds for the created service account