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

variable "private_subnet_ids" {
  type = list(string)
}

variable "node_role_arn" {
  type = string
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}

variable "node_groups_defaults" {
  description = "map of maps of node groups to create. See \"`node_groups` and `node_groups_defaults` keys\" section in README.md for more details"
  type        = any
  default = {
    desired_capacity = 0
    min_capacity = 0
    max_capacity = 3

    instance_types = ["t3.large", "t3a.large"]
    disk_size = 50
    ami_release_version = "1.22.15-20221222"
    force_update_version = true
    ami_type = "AL2_x86_64"
    k8s_labels = {}
    k8s_taints = []
  }
}

variable "single_az_node_groups" {
  type = any
  default = {
    plural_small = {
      name = "plural-small"
      capacity_type = "ON_DEMAND"
      min_capacity = 3
      max_capacity = 9
      desired_capacity = 3
      instance_types = ["t3.large", "t3a.large"]
      k8s_labels = {
        "plural.sh/capacityType" = "ON_DEMAND"
        "plural.sh/performanceType" = "SUSTAINED"
        "plural.sh/scalingGroup" = "plural-small"
      }
      k8s_taints = [
        {
          key = "plural.sh/pluralReserved"
          value = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
    plural_worker_medium = {
      name = "plural-worker-medium"
      capacity_type = "ON_DEMAND"
      min_capacity = 3
      max_capacity = 9
      desired_capacity = 3
      instance_types = ["t3.xlarge", "t3a.xlarge"]
      k8s_labels = {
        "plural.sh/capacityType" = "ON_DEMAND"
        "plural.sh/performanceType" = "SUSTAINED"
        "plural.sh/scalingGroup" = "plural-worker-medium"
      }
      k8s_taints = [
        {
          key = "plural.sh/pluralReserved"
          value = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
  description = "Node groups to add to your cluster. A single managed node group will be created in each availability zone."
}

variable "shell_node_groups" {
  type = any
  default = {
    shell_nodes = {
      name = "shell-nodes"
      capacity_type = "ON_DEMAND"
      min_capacity = 1
      max_capacity = 10
      desired_capacity = 1
      instance_types = ["t3.large"]
      k8s_labels = {
        "plural.sh/capacityType" = "ON_DEMAND"
        "plural.sh/performanceType" = "SUSTAINED"
        "plural.sh/scalingGroup" = "shell-nodes"
        "platform.plural.sh/instance-class" = "shell"
      }
      k8s_taints = [
        {
          key = "platform.plural.sh/taint"
          value = "SHELL"
          effect = "NO_SCHEDULE"
        }
        # {
        #   key = "plural.sh/pluralReserved"
        #   value = "true"
        #   effect = "NO_SCHEDULE"
        # }
      ]
    }
  }
  description = "Node groups to add to your cluster. A single managed node group will be created across all availability zones."
}

variable "private_subnets" {
  description = "A list of private subnets for the EKS worker groups."
  type        = list(any)
  default     = []
}
