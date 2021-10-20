locals {
  gcp_location_parts = split("-", var.gcp_location)
  gcp_region         = "${local.gcp_location_parts[0]}-${local.gcp_location_parts[1]}"
}

resource "google_service_account" "plural" {
  account_id = "plural-account"
  display_name = "Service account for plural"
}

resource "google_service_account_key" "plural" {
  service_account_id = google_service_account.plural.name
  public_key_type = "TYPE_X509_PEM_FILE"

  depends_on = [
    google_service_account.plural
  ]
}

resource "kubernetes_namespace" "plural" {
  metadata {
    name = var.plural_namespace

    labels = {
      "app.kubernetes.io/managed-by" = "plural"
    }
  }
}


resource "kubernetes_secret" "plural" {
  metadata {
    name = "plural-serviceaccount"
    namespace = kubernetes_namespace.plural.metadata[0].name
  }
  data = {
    "gcp.json" = base64decode(google_service_account_key.plural.private_key)
  }
}

resource "google_storage_bucket" "plural_bucket" {
  name = var.plural_bucket
  project = var.gcp_project_id
  force_destroy = true
}

resource "google_storage_bucket" "plural_assets_bucket" {
  name = var.plural_assets_bucket
  project = var.gcp_project_id
  force_destroy = true
}


resource "google_storage_bucket" "plural_images_bucket" {
  name = var.plural_images_bucket
  project = var.gcp_project_id
  force_destroy = true
}

resource "google_storage_bucket_acl" "plural_bucket_acl" {
  bucket = google_storage_bucket.plural_bucket.name
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_acl" "plural_assets_bucket_acl" {
  bucket = google_storage_bucket.plural_assets_bucket.name
  predefined_acl = "publicRead"
}

resource "google_storage_bucket_iam_member" "plural" {
  bucket = google_storage_bucket.plural_bucket.name
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.plural.email}"

  depends_on = [
    google_storage_bucket.plural_bucket,
    google_storage_bucket_acl.plural_bucket_acl
  ]
}

resource "google_storage_bucket_iam_member" "plural_assets" {
  bucket = google_storage_bucket.plural_assets_bucket.name
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.plural.email}"

  depends_on = [
    google_storage_bucket.plural_assets_bucket,
    google_storage_bucket_acl.plural_assets_bucket_acl
  ]
}


resource "google_storage_bucket_iam_member" "plural_images" {
  bucket = google_storage_bucket.plural_images_bucket.name
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.plural.email}"

  depends_on = [
    google_storage_bucket.plural_images_bucket
  ]
}