# Helm Chart for basic kubernetes dependencies

Should include any dependencies you might need per provider


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
external-dns:
  provider: google
  txtOwnerId: myservice
  rbac:
    create: true
    serviceAccountName: external-dns
  domainFilters:
  - myservice.com
  google:
    project: gcp-project-id
    serviceAccountSecret: externaldns
```