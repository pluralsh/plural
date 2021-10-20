gcp_project_id = {{ .Values.gcp_project_id | quote }}
plural_bucket = {{ .Values.chartmuseum_bucket | quote }}
plural_assets_bucket = {{ .Values.assets_bucket | quote }}
plural_images_bucket = {{ .Values.images_bucket | quote }}
plural_namespace = {{ .Namespace }}
cluster_name = {{ .Cluster | quote }}