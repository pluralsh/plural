# Helm chart for installing Chartmart

Chartmart is a multi-tenant kubernetes app repository

## Installation

```
helm repo add chartmart https://mart.piazzaapp.com/chartmart
```

## Usage

```
helm upgrade --install --name chartmart chartmart/chartmart
```

## Example Configuration

```yaml
postgresql:
  postgresqlPassword: supercomplicatedrandombytes

secrets:
  jwt: alsosupercomplicatedrandombytes
  erlang: stillusesupercomplicatedrandombytes

ingress:
  dns: my.chartmart.domain

api:
  bucket: assets-for-chartmart

chartmuseum:
  bucket: bucket-for-chartmuseum

admin:
  enabled: true
  name: "Michael Guarino"
  email: mguarino46@gmail.com
  password: "a very strong password"
  publisher: michaeljguarino
  publisher_description: "A collection of my personal projects"
```

## More configuration

| Parameter | Description | Default |
| --------- | ----------- | ------- |
| replicaCount | number of api replicas | 2 |
| api.bucket | the bucket to use for images | chartmart-assets |
| chartmuseum.bucket | the bucket for charts | chartmart-charts |
| ingress.dns | the dns name to register under | mart.piazzaapp.com |
| ingress.enabled | whether to provision an ingress | true |
