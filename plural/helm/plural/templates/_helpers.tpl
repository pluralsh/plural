{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "plural.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "plural.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "plural.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "plural.labels" -}}
app.kubernetes.io/name: {{ include "plural.name" . }}
helm.sh/chart: {{ include "plural.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}


{{- define "plural.env" -}}
- name: HOST
  value: {{ .Values.ingress.dns }}
- name: DEPLOYED_AT
  value: {{ now | unixEpoch | quote }}
- name: NAMESPACE
  valueFrom:
    fieldRef:
      fieldPath: metadata.namespace
- name: POD_IP
  valueFrom:
    fieldRef:
      fieldPath: status.podIP
- name: POSTGRES_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.dbPasswordSecret }}
      key: password
- name: RABBIT_USERNAME
  valueFrom:
    secretKeyRef:
      name: rabbitmq-default-user
      key: username
- name: RABBIT_PASSWORD
  valueFrom:
    secretKeyRef:
      name: rabbitmq-default-user
      key: password
- name: INFLUX_PASSWORD
  valueFrom:
    secretKeyRef:
      name: influxdb-auth
      key: influxdb-password
- name: RABBIT_NAMESPACE
  value: {{ .Values.rabbitmqNamespace }}
- name: DBHOST
  value: plural-plural
- name: DBSSL
  value: 'true'
{{ if .Values.sentryDsn }}
- name: SENTRY_DSN
  value: {{ .Values.sentryDsn | quote }}
{{ end }}
{{- end -}}
