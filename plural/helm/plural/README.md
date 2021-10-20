# Helm chart for installing Plural

Plural is a multi-tenant kubernetes app delivery platform.  It has as subcomponents:

* postgres db
* rabbitmq cluster
* rtc, api, and background worker deployments
* chartmuseum
* docker registry

## Installation

```
helm repo add plural https://app.plural.sh/cm/plural
```

## Usage

```
helm upgrade --install plural plural/plural
```

## Example Configuration

(It's highly recommend you utilize plural to generate the initial configuration for you based on the environment you're deploying to)

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
