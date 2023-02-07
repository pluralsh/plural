import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Flex } from 'honorable'
import IsEmpty from 'lodash/isEmpty'
import {
  FormField,
  Input,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'

import { OnboardingContext } from '../../../context/onboarding'
import { IsObjectEmpty } from '../../../../../../utils/object'
import { AzureCloudProvider, CloudProvider } from '../../../context/types'
import { useSetCloudProviderKeys, useSetWorkspaceKeys } from '../../../context/hooks'

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

type ValidationFieldKey = keyof AzureCloudProvider | 'resourceGroup'
type Validation = {regex: RegExp, message: string}
type ValidationField = {[key in ValidationFieldKey]?: Validation}

const VALIDATOR: ValidationField = {
  storageAccount: {
    regex: /^[a-z0-9]{3,24}$/,
    message: 'must be between 3 and 24 characters and may contain numbers and lowercase letters only',
  },
  resourceGroup: {
    regex: /^[\w\-().]{0,63}[\w\-()]$/,
    message: 'must be between 1 and 64 characters and may contain alphanumerics, underscores, parentheses, hyphens, and periods (except at end)',
  },
}

function Azure() {
  const { cloud, setValid, workspace } = useContext(OnboardingContext)
  const setCloudProviderKeys = useSetCloudProviderKeys<AzureCloudProvider>(CloudProvider.Azure)
  const setWorkspaceKeys = useSetWorkspaceKeys()
  const [error, setError] = useState<{[key in ValidationFieldKey]?: string | null}>({})
  const isValid = useMemo(() => !IsObjectEmpty(cloud?.azure) && !!workspace?.region && !!workspace?.project && IsObjectEmpty(error), [cloud?.azure, error, workspace?.project, workspace?.region])

  useEffect(() => setValid(isValid), [isValid, setValid])
  useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'eastus' }) : undefined), [setWorkspaceKeys, workspace])
  useEffect(() => (IsEmpty(cloud?.azure) ? setCloudProviderKeys({
    tenantID: '', subscriptionID: '', storageAccount: '', clientSecret: '', clientID: '',
  }) : undefined), [setCloudProviderKeys, cloud?.azure])

  useEffect(() => {
    const merged = { ...cloud?.azure, resourceGroup: workspace?.project }

    Object.keys(merged).forEach(key => {
      const { regex, message } = VALIDATOR[key as keyof AzureCloudProvider] || {}
      const error = regex?.test(merged?.[key]) ? null : message

      if (!regex || !message) return

      setError(err => ({ ...err, [key]: error }))
    })
  }, [cloud?.azure, workspace?.project])

  return (
    <>
      <FormField
        label="Region"
      >
        <Select
          selectedKey={workspace?.region}
          onSelectionChange={value => setWorkspaceKeys({ region: `${value}` })}
        >
          {REGIONS.map(r => (
            <ListBoxItem
              key={r}
              label={r}
              textValue={r}
            />
          ))}

        </Select>
      </FormField>
      <Flex gap="large">
        <FormField
          label="Client ID"
          width="100%"
          required
        >
          <Input
            value={cloud?.azure?.clientID}
            onChange={({ target: { value } }) => setCloudProviderKeys({ clientID: value })}
          />
        </FormField>
        <FormField
          label="Client Secret"
          width="100%"
          required
        >
          <Input
            value={cloud?.azure?.clientSecret}
            onChange={({ target: { value } }) => setCloudProviderKeys({ clientSecret: value })}
            type="password"
          />
        </FormField>
      </Flex>

      <Flex gap="large">
        <FormField
          label="Subscription ID"
          width="100%"
          required
        >
          <Input
            value={cloud?.azure?.subscriptionID}
            onChange={({ target: { value } }) => setCloudProviderKeys({ subscriptionID: value })}
          />
        </FormField>
        <FormField
          label="Tenant ID"
          width="100%"
          required
        >
          <Input
            value={cloud?.azure?.tenantID}
            onChange={({ target: { value } }) => setCloudProviderKeys({ tenantID: value })}
          />
        </FormField>
      </Flex>

      <FormField
        label="Resource Group"
        required
        hint={error.resourceGroup}
        error={!!error.resourceGroup}
      >
        <Input
          value={workspace?.project}
          error={!!error.resourceGroup}
          onChange={({ target: { value } }) => setWorkspaceKeys({ project: value })}
        />
      </FormField>

      <FormField
        label="Storage Account"
        hint={error.storageAccount}
        error={!!error.storageAccount}
        required
      >
        <Input
          value={cloud?.azure?.storageAccount}
          onChange={({ target: { value } }) => setCloudProviderKeys({ storageAccount: value })}
          error={!!error.storageAccount}
        />
      </FormField>
    </>
  )
}

export default Azure
export { REGIONS }
