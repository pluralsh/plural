locals {
  gcp_location_parts = split("-", var.gcp_location)
  gcp_region         = "${local.gcp_location_parts[0]}-${local.gcp_location_parts[1]}"
}

provider "google" {
  version = "2.5.1"
  project = var.gcp_project_id
  region  = local.gcp_region
}

data "google_client_config" "current" {}

data "google_container_cluster" "cluster" {
  name = var.cluster_name
  location = var.gcp_location
}

provider "kubernetes" {
  load_config_file = false
  host = data.google_container_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.google_container_cluster.cluster.master_auth.0.cluster_ca_certificate)
  token = data.google_client_config.current.access_token
}

resource "null_resource" "node_pool" {
  triggers = {
    node_pool = var.node_pool
  }
}

resource "google_service_account" "watchman" {
  account_id = "forge-watchman"
  display_name = "Service account for watchman"
}

resource "google_service_account_key" "watchman" {
  service_account_id = google_service_account.watchman.name
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    google_service_account.watchman
  ]
}

resource "google_project_iam_member" "watchman_admin" {
  project = var.gcp_project_id
  role    = "roles/owner"

  member = "serviceAccount:${google_service_account.watchman.email}"

  depends_on = [
    google_service_account.watchman,
  ]
}


resource "google_project_iam_member" "watchman_storage_admin" {
  project = var.gcp_project_id
  role    = "roles/storage.admin"

  member = "serviceAccount:${google_service_account.watchman.email}"

  depends_on = [
    google_service_account.watchman,
  ]
}

resource "kubernetes_secret" "watchman" {
  metadata {
    name = "watchman-credentials"
    namespace = var.bootstrap_namespace
  }
  data = {
    "gcp.json" = base64decode(google_service_account_key.watchman.private_key)
  }
}