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


resource "google_service_account" "forge" {
  account_id = "forge-account"
  display_name = "Service account for forge"
}

resource "google_service_account_key" "forge" {
  service_account_id = google_service_account.forge.name
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    google_service_account.forge
  ]
}

resource "kubernetes_namespace" "forge" {
  metadata {
    name = var.forge_namespace
  }
}


resource "kubernetes_secret" "forge" {
  metadata {
    name = "forge-serviceaccount"
    namespace = kubernetes_namespace.forge.metadata[0].name
  }
  data = {
    "gcp.json" = base64decode(google_service_account_key.forge.private_key)
  }
}

resource "google_storage_bucket" "forge_bucket" {
  name = var.forge_bucket
  project = var.gcp_project_id
  force_destroy = true
}

resource "google_storage_bucket" "forge_assets_bucket" {
  name = var.forge_assets_bucket
  project = var.gcp_project_id
  force_destroy = true
}


resource "google_storage_bucket" "forge_images_bucket" {
  name = var.forge_images_bucket
  project = var.gcp_project_id
  force_destroy = true
}

resource "google_storage_bucket_acl" "forge_bucket_acl" {
  bucket = google_storage_bucket.forge_bucket.name
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_acl" "forge_assets_bucket_acl" {
  bucket = google_storage_bucket.forge_assets_bucket.name
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_iam_member" "forge" {
  bucket = google_storage_bucket.forge_bucket.name
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.forge.email}"

  depends_on = [
    google_storage_bucket.forge_bucket,
    google_storage_bucket_acl.forge_bucket_acl
  ]
}

resource "google_storage_bucket_iam_member" "forge_assets" {
  bucket = google_storage_bucket.forge_assets_bucket.name
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.forge.email}"

  depends_on = [
    google_storage_bucket.forge_assets_bucket,
    google_storage_bucket_acl.forge_assets_bucket_acl
  ]
}


resource "google_storage_bucket_iam_member" "forge_images" {
  bucket = google_storage_bucket.forge_images_bucket.name
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.forge.email}"

  depends_on = [
    google_storage_bucket.forge_images_bucket
  ]
}