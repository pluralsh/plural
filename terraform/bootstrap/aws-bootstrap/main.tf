data "aws_availability_zones" "available" {}

data "aws_caller_identity" "current" {}

module "vpc" {
  source               = "terraform-aws-modules/vpc/aws"
  version              = "2.47.0"
  name                 = var.vpc_name
  cidr                 = "10.0.0.0/16"
  azs                  = data.aws_availability_zones.available.names
  public_subnets       = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  private_subnets      = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  enable_dns_hostnames = true
  enable_ipv6 = true

  enable_nat_gateway = true
  single_nat_gateway = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
}

module "cluster" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = var.cluster_name
  cluster_version = "1.17"
  subnets         = concat(module.vpc.public_subnets, module.vpc.private_subnets)
  vpc_id          = module.vpc.vpc_id
  enable_irsa     = true

  node_group_defaults = {
    desired_capacity = 2
    min_capacity = 2
    max_capacity = 6

    instance_type = var.instance_type
    disk_size = 50
  }

  node_groups = {
    main = {
      name = "main"
      subnets = vpc.private_subnets
    }
  }
}

resource "aws_route53_zone" "main" {
  name = var.dns_domain
}

resource "kubernetes_namespace" "bootstrap" {
  metadata {
    name = "bootstrap"
  }
}