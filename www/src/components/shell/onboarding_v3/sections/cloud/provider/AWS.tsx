import {
  FormField,
  Input,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { Flex } from 'honorable'
import IsEmpty from 'lodash/isEmpty'

import { OnboardingContext } from '../../../context/onboarding'
import { IsObjectEmpty } from '../../../../../../utils/object'

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
  const {
    cloud, setCloud, setValid, workspace, setWorkspace,
  } = useContext(OnboardingContext)
  const isValid = useMemo(() => !IsObjectEmpty(cloud?.aws) && !IsObjectEmpty(workspace), [cloud, workspace])
  const setCloudKeys = useCallback((records: Record<string, unknown>) => setCloud({ ...cloud, aws: { ...cloud?.aws, ...records } }), [cloud, setCloud])
  const setWorkspaceKeys = useCallback((records: Record<string, unknown>) => setWorkspace({ ...workspace, ...records }), [setWorkspace, workspace])

  useEffect(() => setValid(isValid), [isValid, setValid])
  useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'us-east-2' }) : undefined), [setWorkspaceKeys, workspace])

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
          label="Access Key ID"
          width="100%"
        >
          <Input
            value={cloud?.aws?.accessKey}
            onChange={({ target: { value } }) => setCloudKeys({ accessKey: value })}
          />
        </FormField>
        <FormField
          label="Secret Access Key"
          width="100%"
        >
          <Input
            value={cloud?.aws?.secretKey}
            onChange={({ target: { value } }) => setCloudKeys({ secretKey: value })}
            type="password"
          />
        </FormField>
      </Flex>
    </>
  )
}

export default AWS
