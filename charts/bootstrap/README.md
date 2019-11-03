# Helm Chart for basic kubernetes dependencies

Should include any dependencies you might need per provider


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