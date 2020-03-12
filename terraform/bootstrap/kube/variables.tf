variable "cluster_name" {
  type = string
  default = "piazza"
}

variable "bootstrap_namespace" {
  type = string
  description = <<EOF
Namespace for your forge bucket
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