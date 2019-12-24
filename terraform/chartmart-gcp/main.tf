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

resource "null_resource" "node_pool" {
  triggers = {
    node_pool = "${var.node_pool}"
  }
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


resource "kubernetes_secret" "chartmart" {
  metadata {
    name = "chartmart-serviceaccount"
    namespace = "${var.chartmart_namespace}"
  }
  data = {
    "gcp.json" = "${base64decode(google_service_account_key.chartmart.private_key)}"
  }
}

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


resource "google_storage_bucket" "chartmart_images_bucket" {
  name = "${var.chartmart_images_bucket}"
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
    google_storage_bucket.chartmart_bucket,
    google_storage_bucket_acl.chartmart_bucket_acl
  ]
}

resource "google_storage_bucket_iam_member" "chartmart_assets" {
  bucket = "${google_storage_bucket.chartmart_assets_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.chartmart.email}"

  depends_on = [
    google_storage_bucket.chartmart_assets_bucket,
    google_storage_bucket_acl.chartmart_assets_bucket_acl
  ]
}


resource "google_storage_bucket_iam_member" "chartmart_images" {
  bucket = "${google_storage_bucket.chartmart_images_bucket.name}"
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.chartmart.email}"

  depends_on = [
    google_storage_bucket.chartmart_images_bucket
  ]
}