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
  ValidatedInput,
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

const STORAGE_ACCOUNT_REGEX = /^[a-z0-9]{3,24}$/

function Azure() {
  const { cloud, setValid, workspace } = useContext(OnboardingContext)
  const setCloudProviderKeys = useSetCloudProviderKeys<AzureCloudProvider>(CloudProvider.Azure)
  const setWorkspaceKeys = useSetWorkspaceKeys()
  const [error, setError] = useState<{[key in keyof AzureCloudProvider]: string | null}>({})
  const isValid = useMemo(() => !IsObjectEmpty(cloud?.azure) && !IsObjectEmpty(workspace) && IsObjectEmpty(error), [cloud?.azure, error, workspace])

  useEffect(() => setValid(isValid), [isValid, setValid])
  useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'eastus' }) : undefined), [setWorkspaceKeys, workspace])
  useEffect(() => (IsEmpty(cloud?.azure) ? setCloudProviderKeys({
    tenantID: '', subscriptionID: '', storageAccount: '', clientSecret: '', clientID: '',
  }) : undefined), [setCloudProviderKeys, cloud?.azure])

  useEffect(() => {
    const storageAccount = STORAGE_ACCOUNT_REGEX.test(cloud?.azure?.storageAccount ?? '')
      ? null
      : 'must be between 3 and 24 characters in length and may contain numbers and lowercase letters only'

    setError(err => ({ ...err, storageAccount }))
  }, [cloud?.azure?.storageAccount])

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
      >
        <Input
          value={workspace?.project}
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
