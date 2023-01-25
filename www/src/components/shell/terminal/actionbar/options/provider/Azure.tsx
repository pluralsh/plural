import { Flex } from 'honorable'

import {
  FormField,
  Input,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'

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
  // const { cloud, setValid, workspace } = useContext(OnboardingContext)
  // const setCloudProviderKeys = useSetCloudProviderKeys<AzureCloudProvider>(CloudProvider.Azure)
  // const setWorkspaceKeys = useSetWorkspaceKeys()
  // const isValid = useMemo(() => !IsObjectEmpty(cloud?.azure) && !IsObjectEmpty(workspace), [cloud, workspace])

  // useEffect(() => setValid(isValid), [isValid, setValid])
  // useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'eastus' }) : undefined), [setWorkspaceKeys, workspace])
  // useEffect(() => (IsEmpty(cloud?.azure) ? setCloudProviderKeys({
  //   tenantID: '', subscriptionID: '', storageAccount: '', clientSecret: '', clientID: '', resourceGroup: '',
  // }) : undefined), [setCloudProviderKeys, cloud?.azure])

  return (
    <>
      <FormField label="Region">
        <Select
          selectedKey={null}
          // onSelectionChange={value => setWorkspaceKeys({ region: `${value}` })}
          maxHeight={150}
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
            value={null}
            // onChange={({ target: { value } }) => setCloudProviderKeys({ clientID: value })}
          />
        </FormField>
        <FormField
          label="Client Secret"
          width="100%"
        >
          <Input
            value={null}
            // onChange={({ target: { value } }) => setCloudProviderKeys({ clientSecret: value })}
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
            value={null}
            // onChange={({ target: { value } }) => setCloudProviderKeys({ subscriptionID: value })}
          />
        </FormField>
        <FormField
          label="Tenant ID"
          width="100%"
        >
          <Input
            value={null}
            // onChange={({ target: { value } }) => setCloudProviderKeys({ tenantID: value })}
          />
        </FormField>
      </Flex>

      <FormField label="Resource Group">
        <Input
          value={null}
          // onChange={({ target: { value } }) => setCloudProviderKeys({ resourceGroup: value })}
        />
      </FormField>
      <FormField label="Storage Account">
        <Input
          value={null}
          // onChange={({ target: { value } }) => setCloudProviderKeys({ storageAccount: value })}
        />
      </FormField>
    </>
  )
}

export default Azure
