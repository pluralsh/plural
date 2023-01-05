{{ $bootstrap := .Applications.TerraformValues "bootstrap" }}

chart_bucket = {{ .Values.chartmuseum_bucket | quote }}
plural_assets_bucket = {{ .Values.assets_bucket | quote }}
plural_images_bucket = {{ .Values.images_bucket | quote }}
plural_namespace = {{ .Namespace | quote }}
cluster_name = {{ .Cluster | quote }}
private_subnet_ids = {{ $bootstrap.cluster_worker_private_subnet_ids | toJson }}
node_role_arn = {{ (index $bootstrap.node_groups 0).node_role_arn | quote }}
private_subnets = yamldecode(<<EOT
{{ $bootstrap.cluster_worker_private_subnets | toYaml }}
EOT
)
