gcp_project_id = {{ .Values.gcp_project_id | quote }}
forge_bucket = {{ .Values.chartmuseum_bucket | quote }}
forge_assets_bucket = {{ .Values.assets_bucket | quote }}
forge_images_bucket = {{ .Values.images_bucket | quote }}
forge_namespace = "forge"
cluster_name = {{ .Cluster | quote }}