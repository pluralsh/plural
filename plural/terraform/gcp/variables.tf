variable "cluster_name" {
  type = string
  default = "piazza"
}

variable "plural_bucket" {
  type = string
  description = <<EOF
The bucket the plural deployment will actually use
EOF
}

variable "plural_assets_bucket" {
  type = string
  description = <<EOF
The bucket for uploads/icons and such for the plural deployment
EOF
}

variable "plural_images_bucket" {
  type = string
  description = <<EOF
The bucket for docker images for the plural deployment
EOF
}

variable "plural_namespace" {
  type = string
  default = "plural"
  description = <<EOF
Namespace for your plural bucket
EOF
}

variable "gcp_location" {
  type = string
  default = "us-east1-b"
  description = <<EOF
The region you wish to deploy to
EOF
}

variable "gcp_project_id" {
  type = string
  description = <<EOF
The ID of the project in which the resources belong.
EOF
}

variable "node_pool" {
  type = string
  default = "ignore"
  description = <<EOF
The node pool of the cluster you've bootstrapped
EOF
}
