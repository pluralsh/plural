gcp_project_id = {{ .Values.gcp_project_id | quote }}
dns_domain = "{{ .Values.dns_domain }}."
dns_zone_name = {{ .Values.dns_zone_name | quote }}
cluster_name = {{ .Cluster | quote }}