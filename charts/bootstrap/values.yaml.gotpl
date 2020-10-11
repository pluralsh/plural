external-dns:
  provider: {{ .Values.provider }}
  txtOwnerId: {{ .Values.txt_owner }}
  rbac:
    create: true
    serviceAccountName: {{ default "external-dns" .Values.externaldns_service_account }}
  domainFilters:
  - {{ .Values.dns_domain }}
  google:
    project: {{ .Values.gcp_project_id }}
    serviceAccountSecret: externaldns

grafana_dns: {{ .Values.grafana_dns }}

ownerEmail: {{ .Values.ownerEmail }}

grafana:
  admin:
    password: {{ dedupe . "bootstrap.grafana.admin.password" (randAlphaNum 14) }}
    user: admin
  ingress:
    tls:
    - hosts:
      - {{ .Values.grafana_dns }}
      secretName: grafana-tls
    hosts:
    - {{ .Values.grafana_dns }}