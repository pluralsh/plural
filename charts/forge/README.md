# Helm chart for installing Forge

Forge is a multi-tenant kubernetes app repository

## Installation

```
helm repo add forge https://forge.piazza.app/forge
```

## Usage

```
helm upgrade --install --name forge forge/forge
```

## Example Configuration

```yaml
postgresql:
  postgresqlPassword: supercomplicatedrandombytes

secrets:
  jwt: alsosupercomplicatedrandombytes
  erlang: stillusesupercomplicatedrandombytes

ingress:
  dns: my.forge.domain

api:
  bucket: assets-for-forge

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
| api.bucket | the bucket to use for images | forge-assets |
| chartmuseum.bucket | the bucket for charts | forge-charts |
| ingress.dns | the dns name to register under | forge.piazza.app |
| ingress.enabled | whether to provision an ingress | true |
