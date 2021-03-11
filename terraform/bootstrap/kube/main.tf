locals {
  gcp_location_parts = split("-", var.gcp_location)
  gcp_region         = "${local.gcp_location_parts[0]}-${local.gcp_location_parts[1]}"
}

provider "google" {
  project = var.gcp_project_id
  region  = local.gcp_region
}

resource "null_resource" "node_pool" {
  triggers = {
    node_pool = var.node_pool
  }
}

data "google_client_config" "current" {}

data "google_container_cluster" "cluster" {
  name = var.cluster_name
  location = var.gcp_location
}

provider "kubernetes" {
  version          = " ~> 1.10.0"
  load_config_file = false
  host = data.google_container_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.google_container_cluster.cluster.master_auth.0.cluster_ca_certificate)
  token = data.google_client_config.current.access_token
}

##
# Finally tie everything back into our cluster
##

resource "kubernetes_namespace" "bootstrap" {
  metadata {
    name = var.bootstrap_namespace
    annotations = {
      "cnrm.cloud.google.com/project-id" = var.gcp_project_id
    }
  }
  depends_on = [
    null_resource.node_pool
  ]
}

resource "google_service_account" "externaldns" {
  account_id   = "forge-externaldns"
  display_name = "ExternalDns"
}

resource "google_service_account_key" "externaldns" {
  service_account_id = google_service_account.externaldns.name
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    google_service_account.externaldns
  ]
}

resource "google_project_iam_member" "externaldns_dns_admin" {
  project = var.gcp_project_id
  role    = "roles/dns.admin"

  member = "serviceAccount:${google_service_account.externaldns.email}"

  depends_on = [
    google_service_account.externaldns,
  ]
}

resource "kubernetes_secret" "externaldns" {
  metadata {
    name = "externaldns"
    namespace = var.bootstrap_namespace
  }
  data = {
    "credentials.json" = base64decode(google_service_account_key.externaldns.private_key)
  }

  depends_on = [
    kubernetes_namespace.bootstrap
  ]
}

output "namespace" {
  value = kubernetes_namespace.bootstrap.metadata[0].name
}