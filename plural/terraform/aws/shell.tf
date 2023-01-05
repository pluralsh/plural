module "shell_node_group" {
  source = "github.com/pluralsh/module-library//terraform/eks-node-groups/multi-az-node-groups?ref=20e64863ffc5e361045db8e6b81b9d244a55809e"
  cluster_name           = var.cluster_name
  default_iam_role_arn   = var.node_role_arn
  tags                   = var.tags
  node_groups_defaults   = var.node_groups_defaults

  node_groups            = var.shell_node_groups
  set_desired_size       = false
  private_subnet_ids        = var.private_subnet_ids
}

moved {
  from = module.shell_node_group.aws_eks_node_group.gpu_inf_small
  to   = module.shell_node_group.aws_eks_node_group.workers["shell_nodes"]
}
