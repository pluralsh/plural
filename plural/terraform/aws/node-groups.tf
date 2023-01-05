module "node_groups" {
  source                 = "github.com/pluralsh/module-library//terraform/eks-node-groups/single-az-node-groups?ref=20e64863ffc5e361045db8e6b81b9d244a55809e"
  cluster_name           = var.cluster_name
  default_iam_role_arn   = var.node_role_arn
  tags                   = var.tags
  node_groups_defaults   = var.node_groups_defaults

  node_groups            = var.single_az_node_groups
  set_desired_size       = false
  private_subnets        = var.private_subnets
}
