variable "gcp_project_id" {
  type = string

  description = <<EOF
The ID of the project in which the resources belong.
EOF
}

variable "cluster_name" {
  type = string
  default = "piazza"

  description = <<EOF
The name of the cluster, unique within the project and zone.
EOF
}

variable "gcp_location" {
  type = string
  default = "us-east1-b"

  description = <<EOF
The location (region or zone) in which the cluster master will be created,
as well as the default node location. If you specify a zone (such as
us-central1-a), the cluster will be a zonal cluster with a single cluster
master. If you specify a region (such as us-west1), the cluster will be a
regional cluster with multiple masters spread across zones in that region.
Node pools will also be created as regional or zonal, to match the cluster.
If a node pool is zonal it will have the specified number of nodes in that
zone. If a node pool is regional it will have the specified number of nodes
in each zone within that region. For more information see:
https://cloud.google.com/kubernetes-engine/docs/concepts/regional-clusters
EOF
}

variable "daily_maintenance_window_start_time" {
  type = string
  default = "03:00"

  description = <<EOF
The start time of the 4 hour window for daily maintenance operations RFC3339
format HH:MM, where HH : [00-23] and MM : [00-59] GMT.
EOF
}

variable "node_pools" {
  type = list
  default = [
    {
      name                       = "default"
      initial_node_count         = 2
      autoscaling_min_node_count = 2
      autoscaling_max_node_count = 5
      management_auto_upgrade    = true
      management_auto_repair     = true
      node_config_machine_type   = "n1-standard-2"
      node_config_disk_type      = "pd-standard"
      node_config_disk_size_gb   = 100
      node_config_preemptible    = false
    },
  ]

  description = <<EOF
The list of node pool configurations, each should include:
name - The name of the node pool, which will be suffixed with '-pool'.
Defaults to pool number in the Terraform list, starting from 1.
initial_node_count - The initial node count for the pool. Changing this will
force recreation of the resource. Defaults to 1.
autoscaling_min_node_count - Minimum number of nodes in the NodePool. Must be
>=0 and <= max_node_count. Defaults to 2.
autoscaling_max_node_count - Maximum number of nodes in the NodePool. Must be
>= min_node_count. Defaults to 3.
management_auto_repair - Whether the nodes will be automatically repaired.
Defaults to 'true'.
management_auto_upgrade - Whether the nodes will be automatically upgraded.
Defaults to 'true'.
node_config_machine_type - The name of a Google Compute Engine machine type.
Defaults to n1-standard-1. To create a custom machine type, value should be
set as specified here:
https://cloud.google.com/compute/docs/reference/rest/v1/instances#machineType
node_config_disk_type - Type of the disk attached to each node (e.g.
'pd-standard' or 'pd-ssd'). Defaults to 'pd-standard'
node_config_disk_size_gb - Size of the disk attached to each node, specified
in GB. The smallest allowed disk size is 10GB. Defaults to 100GB.
node_config_preemptible - Whether or not the underlying node VMs are
preemptible. See the official documentation for more information. Defaults to
false. https://cloud.google.com/kubernetes-engine/docs/how-to/preemptible-vms
EOF
}

variable "vpc_network_name" {
  type = string
  default = "forge-network"

  description = <<EOF
The name of the Google Compute Engine network to which the cluster is
connected.
EOF
}

variable "vpc_subnetwork_name" {
  type = string
  default = "forge-subnetwork"

  description = <<EOF
The name of the Google Compute Engine subnetwork in which the cluster's
instances are launched.
EOF
}

variable "vpc_subnetwork_cidr_range" {
  type = string
  default = "10.0.16.0/20"
}

variable "cluster_secondary_range_name" {
  type = string
  default = "pods"

  description = <<EOF
The name of the secondary range to be used as for the cluster CIDR block.
The secondary range will be used for pod IP addresses. This must be an
existing secondary range associated with the cluster subnetwork.
EOF
}

variable "cluster_secondary_range_cidr" {
  type = string
  default = "10.16.0.0/12"
}

variable "services_secondary_range_name" {
  type = string
  default = "services"

  description = <<EOF
The name of the secondary range to be used as for the services CIDR block.
The secondary range will be used for service ClusterIPs. This must be an
existing secondary range associated with the cluster subnetwork.
EOF
}

variable "services_secondary_range_cidr" {
  type = string
  default = "10.1.0.0/20"
}

variable "master_ipv4_cidr_block" {
  type    = string
  default = "172.16.0.0/28"

  description = <<EOF
The IP range in CIDR notation to use for the hosted master network. This
range will be used for assigning internal IP addresses to the master or set
of masters, as well as the ILB VIP. This range must not overlap with any
other ranges in use within the cluster's network.
EOF
}

variable "access_private_images" {
  type    = string
  default = "false"

  description = <<EOF
Whether to create the IAM role for storage.objectViewer, required to access
GCR for private container images.
EOF
}

variable "http_load_balancing_disabled" {
  type    = string
  default = "false"

  description = <<EOF
The status of the HTTP (L7) load balancing controller addon, which makes it
easy to set up HTTP load balancers for services in a cluster. It is enabled
by default; set disabled = true to disable.
EOF
}

variable "master_authorized_networks_cidr_block" {
  type = string
  default = "0.0.0.0/0"
}

variable "master_authorized_networks_cidr_display" {
  type = string
  default = "default"
}

variable "dns_domain" {
  type = string
  description = "The domain name you'll register piazza under"
}

variable "dns_zone_name" {
  type = string
  description = "The name for your dns zone"
  default = "piazza"
}