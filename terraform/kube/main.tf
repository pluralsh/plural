locals {
  gcp_location_parts = split("-", var.gcp_location)
  gcp_region         = "${local.gcp_location_parts[0]}-${local.gcp_location_parts[1]}"
}

provider "google" {
  version = "2.5.1"
  project = "${var.gcp_project_id}"
  region  = "${local.gcp_region}"
}

data "google_client_config" "current" {}

data "google_container_cluster" "cluster" {
  name = "${var.cluster_name}"
  location = "${var.gcp_location}"
}

provider "kubernetes" {
  load_config_file = false
  host = "${data.google_container_cluster.cluster.endpoint}"
  cluster_ca_certificate = "${base64decode(data.google_container_cluster.cluster.master_auth.0.cluster_ca_certificate)}"
  token = "${data.google_client_config.current.access_token}"
}

resource "google_service_account" "chartmart" {
  account_id = "chartmart"
  display_name = "Service account for chartmart"
}

resource "google_service_account_key" "chartmart" {
  service_account_id = "${google_service_account.chartmart.name}"
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    google_service_account.chartmart
  ]
}

##
# Create our gcs bucket
##

resource "google_storage_bucket" "chartmart_bucket" {
  name = "${var.chartmart_bucket}"
  project = "${var.gcp_project_id}"
  force_destroy = true
}

resource "google_storage_bucket" "chartmart_assets_bucket" {
  name = "${var.chartmart_assets_bucket}"
  project = "${var.gcp_project_id}"
  force_destroy = true
}

resource "google_storage_bucket_acl" "chartmart_bucket_acl" {
  bucket = "${google_storage_bucket.chartmart_bucket.name}"
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_acl" "chartmart_assets_bucket_acl" {
  bucket = "${google_storage_bucket.chartmart_assets_bucket.name}"
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_iam_member" "chartmart" {
  bucket = "${google_storage_bucket.chartmart_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.chartmart.email}"

  depends_on = [
    google_service_account.chartmart,
    google_storage_bucket.chartmart_bucket
  ]
}

resource "google_storage_bucket_iam_member" "chartmart_assets" {
  bucket = "${google_storage_bucket.chartmart_assets_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.chartmart.email}"

  depends_on = [
    google_service_account.chartmart,
    google_storage_bucket.chartmart_assets_bucket
  ]
}

##
# Finally tie everything back into our cluster
##

resource "kubernetes_namespace" "chartmart" {
  metadata {
    name = "${var.chartmart_namespace}"
    annotations = {
      "cnrm.cloud.google.com/project-id" = "${var.gcp_project_id}"
    }
  }
}

resource "kubernetes_secret" "chartmart" {
  metadata {
    name = "chartmart-serviceaccount"
    namespace = "chartmart"
  }
  data = {
    "gcp.json" = "${base64decode(google_service_account_key.chartmart.private_key)}"
  }

  depends_on = [
    kubernetes_namespace.chartmart
  ]
}

resource "google_service_account" "externaldns" {
  account_id   = "externaldns"
  display_name = "ExternalDns"
}

resource "google_service_account_key" "externaldns" {
  service_account_id = "${google_service_account.externaldns.name}"
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    google_service_account.externaldns
  ]
}

resource "google_project_iam_member" "externaldns_dns_admin" {
  project = "${var.gcp_project_id}"
  role    = "roles/dns.admin"

  member = "serviceAccount:${google_service_account.externaldns.email}"

  depends_on = [
    google_service_account.externaldns,
  ]
}

resource "kubernetes_secret" "externaldns" {
  metadata {
    name = "externaldns"
    namespace = "chartmart"
  }
  data = {
    "credentials.json" = "${base64decode(google_service_account_key.externaldns.private_key)}"
  }
}