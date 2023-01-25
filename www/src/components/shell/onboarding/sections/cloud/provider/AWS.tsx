import { useContext, useEffect, useMemo } from 'react'
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
import { AWSCloudProvider, CloudProvider } from '../../../context/types'
import { useSetCloudProviderKeys, useSetWorkspaceKeys } from '../../../context/hooks'

const REGIONS = [
  'af-south-1',
  'eu-north-1',
  'ap-south-1',
  'eu-west-3',
  'eu-west-2',
  'eu-south-1',
  'eu-west-1',
  'ap-northeast-3',
  'ap-northeast-2',
  'me-south-1',
  'ap-northeast-1',
  'sa-east-1',
  'ca-central-1',
  'ap-east-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'eu-central-1',
  'ap-southeast-3',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
]

function AWS() {
  const { cloud, setValid, workspace } = useContext(OnboardingContext)
  const setCloudProviderKeys = useSetCloudProviderKeys<AWSCloudProvider>(CloudProvider.AWS)
  const setWorkspaceKeys = useSetWorkspaceKeys()
  const isValid = useMemo(() => !IsObjectEmpty(cloud?.aws) && !IsObjectEmpty(workspace!), [cloud, workspace])

  useEffect(() => setValid(isValid), [isValid, setValid])
  useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'us-east-2' }) : undefined), [setWorkspaceKeys, workspace])
  useEffect(() => (IsEmpty(cloud?.aws) ? setCloudProviderKeys({ secretKey: '', accessKey: '' }) : undefined), [setCloudProviderKeys, cloud?.aws])

  return (
    <>
      <FormField label="Region">
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
          label="Access Key ID"
          width="100%"
        >
          <Input
            value={cloud?.aws?.accessKey}
            onChange={({ target: { value } }) => setCloudProviderKeys({ accessKey: value })}
          />
        </FormField>
        <FormField
          label="Secret Access Key"
          width="100%"
        >
          <Input
            value={cloud?.aws?.secretKey}
            onChange={({ target: { value } }) => setCloudProviderKeys({ secretKey: value })}
            type="password"
          />
        </FormField>
      </Flex>
    </>
  )
}

export default AWS
export { REGIONS }
