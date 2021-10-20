postgresql:
  postgresqlPassword: {{ dedupe . "plural.postgresql.postgresqlPassword" (randAlphaNum 14) }}
  postgresqlPostgresPassword: {{ dedupe . "plural.postgresql.postgresqlPostgresPassword" (randAlphaNum 14) }}

influxdb:
  setDefaultUser:
    user:
      password: {{ dedupe . "plural.influxdb.setDefaultUser.user.password" (randAlphaNum 26) }}

provider: {{ .Provider }}
region: {{ .Region }}

rabbitmqNamespace: {{ namespace "rabbitmq" }}
influxNamespace: {{ namespace "influx" }}

rbac:
  serviceAccountAnnotations:
    eks.amazonaws.com/role-arn: "arn:aws:iam::{{ .Project }}:role/{{ .Cluster }}-plural"

registry:
  rbac:
    serviceAccountAnnotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::{{ .Project }}:role/{{ .Cluster }}-plural"
  configData:
    storage:
      {{ if eq .Provider "google" }}
      gcs:
        bucket: {{ .Values.images_bucket }}
      {{ end }}
      {{ if eq .Provider "aws" }}
      s3:
        region: {{ .Region }}
        bucket: {{ .Values.images_bucket }}
      {{ end }}
    auth:
      token:
        realm: https://{{ .Values.plural_dns }}/auth/token
        service: {{ .Values.plural_dkr_dns }}
        issuer: {{ .Values.plural_dns }}

{{ $certificate := genCA "plural" 1886 }}

secrets:
  jwt: {{ dedupe . "plural.secrets.jwt" (randAlphaNum 14) }}
  erlang: {{ dedupe . "plural.secrets.erlang" (randAlphaNum 14) }}
  jwt_pk: {{ dedupe . "plural.secrets.jwt_pk" $certificate.Key | quote }}
  jwt_cert: {{ dedupe . "plural.secrets.jwt_cert" $certificate.Cert | quote }}
  jwt_aud: {{ .Values.plural_dkr_dns }}
  jwt_iss: {{ .Values.plural_dns }}
  aes_key: {{ dedupe . "plural.secrets.aes_key" genAESKey }}

admin:
  enabled: true
  name: {{ .Values.admin_name }}
  email: {{ .Values.admin_email }}
  password: {{ dedupe . "plural.admin.password" (randAlphaNum 14) }}
  publisher: {{ .Values.publisher }}
  publisher_description: {{ .Values.publisher_description }}

ingress:
  dns: {{ .Values.plural_dns }}
  dkr_dns: {{ .Values.plural_dkr_dns }}

api:
  bucket: {{ .Values.assets_bucket }}

chartmuseum:
  bucket: {{ .Values.chartmuseum_bucket }}
  rbac:
    serviceAccountAnnotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::{{ .Project }}:role/{{ .Cluster }}-plural"

{{ $hydraPassword := dedupe . "plural.hydraPassword" (randAlphaNum 20) }}
{{ $hydraHost := default "hydra.plural.sh" .Values.hydra_host }}
hydraPassword: {{ $hydraPassword }}
configureHydra: true
hydraSecrets:
  system: {{ dedupe . "plural.hydraSecrets.system" (randAlphaNum 20) }}
  cookie: {{ dedupe . "plural.hydraSecrets.cookie" (randAlphaNum 20) }}
  dsn: "postgres://hydra:{{ $hydraPassword }}@plural-hydra:5432/hydra"

hydra:
  hydra:
    config:
      dsn: "postgres://hydra:{{ $hydraPassword }}@plural-hydra:5432/hydra"
      secrets:
        system: {{ dedupe . "plural.hydra.secrets.system" (randAlphaNum 20) }}
        cookie: {{ dedupe . "plural.hydra.secrets.cookie" (randAlphaNum 20) }}
      urls:
        self:
          issuer: https://{{ $hydraHost }}/
        login: https://{{ .Values.plural_dns }}/login
        consent: https://{{ .Values.plural_dns }}/oauth/consent
  ingress:
    public:
      hosts:
      - host: {{ $hydraHost }}
        paths: ["/.*"]
      tls:
      - hosts:
        - {{ $hydraHost }}
        secretName: hydra-tls
      
license: {{ .License | quote }}