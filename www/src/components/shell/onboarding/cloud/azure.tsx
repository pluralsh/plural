import { useCallback, useEffect, useMemo } from 'react'
import { MenuItem, Select } from 'honorable'
import { FormField, Input } from 'pluralsh-design-system'

import { stringExists } from '../../validation'

const REGIONS = [
  'eastus',
  'eastus2',
  'southcentralus',
  'westus2',
  'westus3',
  'australiaeast',
  'southeastasia',
  'northeurope',
  'swedencentral',
  'uksouth',
  'westeurope',
  'centralus',
  'southafricanorth',
  'centralindia',
  'eastasia',
  'japaneast',
  'koreacentral',
  'canadacentral',
  'francecentral',
  'germanywestcentral',
  'norwayeast',
  'brazilsouth',
]

export const AZURE_VALIDATIONS = [
  { field: 'credentials.workspace.region', func: stringExists, name: 'region' },
  {
    field: 'credentials.azure.clientId',
    func: stringExists,
    name: 'client id',
  },
  {
    field: 'credentials.azure.storageAccount',
    func: stringExists,
    name: 'storage account',
  },
  {
    field: 'credentials.azure.subscriptionId',
    func: stringExists,
    name: 'subscription id',
  },
  {
    field: 'credentials.azure.tenantId',
    func: stringExists,
    name: 'tenant id',
  },
  {
    field: 'credentials.azure.clientSecret',
    func: stringExists,
    name: 'client secret',
  },
]

export const azureSynopsis = ({ workspace, credentials }) => [
  { name: 'Region', value: workspace.region },
  { name: 'Project', value: workspace.project },
  { name: 'Client Id', value: credentials.azure.clientId },
  { name: 'Storage Account', value: credentials.azure.storageAccount },
  { name: 'Subscription Id', value: credentials.azure.subscriptionId },
  { name: 'Tenant Id', value: credentials.azure.tenantId },
  { name: 'Client Secret', value: '*****REDACTED****' },
]

export function AzureForm({
  credentials,
  setCredentials,
  workspace,
  setWorkspace,
}) {
  const azure = useMemo(() => credentials.azure || {}, [credentials])

  const update = useCallback((field, val) => setCredentials({
    ...credentials,
    azure: { ...credentials.azure, [field]: val },
  }),
  [setCredentials, credentials])
  const setRegion = useCallback(r => setWorkspace({ ...workspace, region: r }),
    [setWorkspace, workspace])
  const setProject = useCallback(p => setWorkspace({ ...workspace, project: p }), [setWorkspace, workspace])

  const region = workspace.region || 'eastus'

  useEffect(() => {
    if (!workspace.region) setRegion(region)
  }, [azure, region, setRegion, workspace])

  return (
    <>
      <FormField
        width="100%"
        marginBottom="large"
        label="Region"
      >
        <Select
          width="100%"
          onChange={({ target: { value } }) => {
            setRegion(value)
          }}
          value={region}
        >
          {REGIONS.map(region => (
            <MenuItem
              key={region}
              value={region}
            >
              {region}
            </MenuItem>
          ))}
        </Select>
      </FormField>
      <FormField
        width="100%"
        marginBottom="large"
        label="Resource Group"
      >
        <Input
          width="100%"
          value={workspace.project || ''}
          onChange={({ target: { value } }) => setProject(value)}
        />
      </FormField>
      <FormField
        width="100%"
        marginBottom="large"
        label="Storage Account"
      >
        <Input
          width="100%"
          value={azure.storageAccount || ''}
          onChange={({ target: { value } }) => update('storageAccount', value)}
        />
      </FormField>
      <FormField
        width="100%"
        marginBottom="large"
        label="Subscription ID"
      >
        <Input
          width="100%"
          value={azure.subscriptionId || ''}
          onChange={({ target: { value } }) => update('subscriptionId', value)}
        />
      </FormField>
      <FormField
        width="100%"
        marginBottom="large"
        label="Tenant ID"
      >
        <Input
          width="100%"
          value={azure.tenantId || ''}
          onChange={({ target: { value } }) => update('tenantId', value)}
        />
      </FormField>
      <FormField
        width="100%"
        marginBottom="large"
        label="Client ID"
      >
        <Input
          width="100%"
          value={azure.clientId || ''}
          onChange={({ target: { value } }) => update('clientId', value)}
        />
      </FormField>
      <FormField
        width="100%"
        label="Client Secret"
      >
        <Input
          width="100%"
          value={azure.clientSecret || ''}
          onChange={({ target: { value } }) => update('clientSecret', value)}
        />
      </FormField>
    </>
  )
}
