terraform {
  # Use a GCS Bucket as a backend
  backend "gcs" {
    prefix = "terraform/chartmart"
  }
}

locals {
  gcp_location_parts = split("-", var.gcp_location)
  gcp_region         = "${local.gcp_location_parts[0]}-${local.gcp_location_parts[1]}"
}

provider "google" {
  version = "2.5.1"
  project = "${var.gcp_project_id}"
  region  = "${local.gcp_region}"
}

data "google_container_cluster" "chartmart_cluster" {
  name = "${var.cluster_name}"
  location = "${var.gcp_location}"
}

provider "kubernetes" {
  host = "${data.google_container_cluster.chartmart_cluster.endpoint}"
}

resource "google_service_account" "chartmart" {
  account_id = "chartmart"
  display_name = "Service account for chartmart"
}

resource "google_service_account_key" "chartmart" {
  service_account_id = "${google_service_account.chartmart.name}"
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    "google_service_account.chartmart"
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

resource "google_storage_bucket_acl" "chartmart_assets__bucket_acl" {
  bucket = "${google_storage_bucket.chartmart_assets_bucket.name}"
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_iam_member" "chartmart" {
  bucket = "${google_storage_bucket.chartmart_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.chartmart.email}"

  depends_on = [
    "google_service_account.chartmart",
    "google_storage_bucket.chartmart_bucket"
  ]
}

resource "google_storage_bucket_iam_member" "chartmart_assets" {
  bucket = "${google_storage_bucket.chartmart_assets_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.chartmart.email}"

  depends_on = [
    "google_service_account.chartmart",
    "google_storage_bucket.chartmart_assets_bucket"
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
    "kubernetes_namespace.chartmart"
  ]
}