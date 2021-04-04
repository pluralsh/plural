variable "cluster_name" {
  type = string
  default = "piazza"
}

variable "forge_bucket" {
  type = string
  description = <<EOF
The bucket the forge deployment will actually use
EOF
}

variable "forge_assets_bucket" {
  type = string
  description = <<EOF
The bucket for uploads/icons and such for the forge deployment
EOF
}

variable "forge_images_bucket" {
  type = string
  description = <<EOF
The bucket for docker images for the forge deployment
EOF
}

variable "forge_namespace" {
  type = string
  default = "forge"
  description = <<EOF
Namespace for your forge bucket
EOF
}

variable "aws_locationn" {
  type = string
  default = "us-east-1"
  description = <<EOF
The region you wish to deploy to
EOF
}

variable "forge_serviceaccount" {
  type = string
  default = "forge"
  description = "name of forge's service account"
}