postgresql:
  postgresqlPassword: {{ dedupe . "forge.postgresql.postgresqlPassword" (randAlphaNum 14) }}

registry:
  configData:
    storage:
      gcs:
        bucket: {{ .Values.images_bucket }}
    auth:
      token:
        realm: https://{{ .Values.forge_dns }}/auth/token
        service: {{ .Values.forge_dkr_dns }}
        issuer: {{ .Values.forge_dns }}

{{ $certificate := genCA "forge" 1886 }}

secrets:
  jwt: {{ dedupe . "forge.secrets.jwt" (randAlphaNum 14) }}
  erlang: {{ dedupe . "forge.secrets.erlang" (randAlphaNum 14) }}
  jwt_pk: {{ dedupe . "forge.secrets.jwt_pk" $certificate.Key | quote }}
  jwt_cert: {{ dedupe . "forge.secrets.jwt_cert" $certificate.Cert | quote }}
  jwt_aud: {{ .Values.forge_dkr_dns }}
  jwt_iss: {{ .Values.forge_dns }}
  aes_key: {{ dedupe . "forge.secrets.aes_key" genAESKey }}

admin:
  enabled: true
  name: {{ .Values.admin_name }}
  email: {{ .Values.admin_email }}
  password: {{ dedupe . "forge.admin.password" (randAlphaNum 14) }}
  publisher: {{ .Values.publisher }}
  publisher_description: {{ .Values.publisher_description }}

ingress:
  dns: {{ .Values.forge_dns }}
  dkr_dns: {{ .Values.forge_dkr_dns }}

api:
  bucket: {{ .Values.assets_bucket }}

chartmuseum:
  bucket: {{ .Values.chartmuseum_bucket }}

license: {{ .License | quote }}