data "aws_eks_cluster" "cluster" {
  name = var.cluster_name
}

module "asummable_role_autoscaler" {
  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version                       = "2.14.0"
  create_role                   = true
  role_name                     = "forge-s3"
  provider_url                  = replace(aws_eks_cluster.cluster.identity[0].oidc[0].issuer, "https://", "")
  role_policy_arns              = [aws_iam_policy.s3_admin.arn]
  oidc_fully_qualified_subjects = ["system:serviceaccount:${var.forge_namespace}:${var.forge_serviceaccount}"]
}

resource "aws_iam_policy" "s3_admin" {
  name_prefix = "forge-s3-admin"
  description = "s3 access policy for forge"
  policy      = data.aws_iam_policy_document.s3_admin.json
}

data "aws_iam_policy_document" "s3_admin" {
  statement {
    sid    = "s3Admin"
    effect = "Allow"

    actions = ["s3:*"]

    resources = [
      "arn:aws:s3:::${var.forge_bucket}",
      "arn:aws:s3:::${var.forge_images_bucket}",
      "arn:aws:s3:::${var.forge_assets_bucket}",
      "arn:aws:s3:::${var.forge_bucket}/*",
      "arn:aws:s3:::${var.forge_images_bucket}/*",
      "arn:aws:s3:::${var.forge_assets_bucket}/*"
    ]
  }
}

resource "kubernetes_namespace" "forge" {
  metadata {
    name = var.forge_namespace
  }
}

resource "aws_s3_bucket" "forge_bucket" {
  bucket = var.forge_bucket
  acl    = "private"
}

resource "aws_s3_bucket" "forge_assets_bucket" {
  bucket = var.forge_assets_bucket
  acl    = "private"
}

resource "aws_s3_bucket" "forge_images_bucket" {
  bucket = var.forge_images_bucket
  acl    = "private"
}
