variable "cluster_name" {
  type = string
  default = "piazza"
}

variable "chart_bucket" {
  type = string
  description = <<EOF
The bucket the plural deployment will use for chart storage 
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

variable "aws_location" {
  type = string
  default = "us-east-1"
  description = <<EOF
The region you wish to deploy to
EOF
}

variable "plural_serviceaccount" {
  type = string
  default = "plural"
  description = <<EOF
The k8s service account that will be used for plural deployments 
EOF
}