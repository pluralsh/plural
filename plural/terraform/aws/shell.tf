module "shell_node_group" {
  source = "github.com/pluralsh/module-library//terraform/eks-node-groups/multi-az-node-group"
  
  node_group_name = "shell-nodes"
  cluster_name    = var.cluster_name
  instance_types  = ["t3.large"]
  subnet_ids      = var.shell_subnet_ids
  desired_size    = 1
  min_capacity    = 1
  max_capacity    = 10
  
  labels = {
    "platform.plural.sh/instance-class" = "shell"
  }

  tags = {}

  taints = [
    {
      key = "platform.plural.sh/taint"
      value = "SHELL"
      effect = "NO_SCHEDULE"
    }
  ]
}