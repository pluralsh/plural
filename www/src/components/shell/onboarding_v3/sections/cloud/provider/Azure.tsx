import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import {
  FormField,
  Input,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import { Flex } from 'honorable'
import IsEmpty from 'lodash/isEmpty'

import { OnboardingContext } from '../../../context/onboarding'
import { IsObjectEmpty } from '../../../../../../utils/object'

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

function Azure() {
  const {
    cloud, setCloud, setValid, workspace, setWorkspace,
  } = useContext(OnboardingContext)
  const isValid = useMemo(() => !IsObjectEmpty(cloud?.azure) && !IsObjectEmpty(workspace), [cloud, workspace])
  const setCloudKeys = useCallback((records: Record<string, unknown>) => setCloud({ ...cloud, azure: { ...cloud?.azure, ...records } }), [cloud, setCloud])
  const setWorkspaceKeys = useCallback((records: Record<string, unknown>) => setWorkspace({ ...workspace, ...records }), [setWorkspace, workspace])

  useEffect(() => setValid(isValid), [isValid, setValid])
  useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'eastus' }) : undefined), [setWorkspaceKeys, workspace])

  return (
    <>
      <FormField label="Region">
        <Select
          selectedKey={workspace?.region}
          onSelectionChange={value => setWorkspaceKeys({ region: value })}
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
        >
          <Input
            value={cloud?.azure?.clientID}
            onChange={({ target: { value } }) => setCloudKeys({ clientID: value })}
          />
        </FormField>
        <FormField
          label="Client Secret"
          width="100%"
        >
          <Input
            value={cloud?.azure?.clientSecret}
            onChange={({ target: { value } }) => setCloudKeys({ clientSecret: value })}
            type="password"
          />
        </FormField>
      </Flex>

      <Flex gap="large">
        <FormField
          label="Subscription ID"
          width="100%"
        >
          <Input
            value={cloud?.azure?.subscriptionID}
            onChange={({ target: { value } }) => setCloudKeys({ subscriptionID: value })}
          />
        </FormField>
        <FormField
          label="Tenant ID"
          width="100%"
        >
          <Input
            value={cloud?.azure?.tenantID}
            onChange={({ target: { value } }) => setCloudKeys({ tenantID: value })}
          />
        </FormField>
      </Flex>

      <FormField label="Resource Group">
        <Input
          value={cloud?.azure?.resourceGroup}
          onChange={({ target: { value } }) => setCloudKeys({ resourceGroup: value })}
        />
      </FormField>
      <FormField label="Storage Account">
        <Input
          value={cloud?.azure?.storageAccount}
          onChange={({ target: { value } }) => setCloudKeys({ storageAccount: value })}
        />
      </FormField>
    </>
  )
}

export default Azure
