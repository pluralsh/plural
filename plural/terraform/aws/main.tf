data "aws_eks_cluster" "cluster" {
  name = var.cluster_name
}

module "asummable_role_autoscaler" {
  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version                       = "3.14.0"
  create_role                   = true
  role_name                     = "${var.cluster_name}-plural"
  provider_url                  = replace(data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer, "https://", "")
  role_policy_arns              = [aws_iam_policy.s3_admin.arn]
  oidc_fully_qualified_subjects = ["system:serviceaccount:${var.plural_namespace}:${var.plural_serviceaccount}"]
}


data "aws_iam_role" "postgres" {
  name = "${var.cluster_name}-postgres"
}

resource "kubernetes_service_account" "postgres" {
  metadata {
    name      = "postgres-pod"
    namespace = var.plural_namespace

    annotations = {
      "eks.amazonaws.com/role-arn" = data.aws_iam_role.postgres.arn
    }
  }

  depends_on = [
    kubernetes_namespace.plural
  ]
}

resource "aws_iam_policy" "s3_admin" {
  name_prefix = "plural"
  description = "s3 access policy for plural"
  policy      = data.aws_iam_policy_document.s3_admin.json
}

data "aws_iam_policy_document" "s3_admin" {
  statement {
    sid    = "s3Admin"
    effect = "Allow"

    actions = ["s3:*"]

    resources = [
      "arn:aws:s3:::${var.chart_bucket}",
      "arn:aws:s3:::${var.plural_images_bucket}",
      "arn:aws:s3:::${var.plural_assets_bucket}",
      "arn:aws:s3:::${var.chart_bucket}/*",
      "arn:aws:s3:::${var.plural_images_bucket}/*",
      "arn:aws:s3:::${var.plural_assets_bucket}/*"
    ]
  }
}

resource "kubernetes_namespace" "plural" {
  metadata {
    name = var.plural_namespace
    
    labels = {
      "app.kubernetes.io/managed-by" = "plural"
    }
  }
}

resource "aws_s3_bucket" "chart_bucket" {
  bucket = var.chart_bucket
  acl    = "private"
  force_destroy = true
}

resource "aws_s3_bucket" "plural_assets_bucket" {
  bucket = var.plural_assets_bucket
  acl    = "public-read"
  force_destroy = true
}

resource "aws_s3_bucket" "plural_images_bucket" {
  bucket = var.plural_images_bucket
  acl    = "public-read"
  force_destroy = true
}