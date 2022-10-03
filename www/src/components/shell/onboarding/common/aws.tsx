import { useCallback, useEffect, useMemo } from 'react'
import { MenuItem, Select } from 'honorable'
import { FormField, Input } from 'pluralsh-design-system'

import { usePersistedCredentials, usePersistedWorkspace } from '../../usePersistance'

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

export const awsSynopsis = ({ workspace, credentials }) => (
  [
    { name: 'Region', value: workspace.region },
    { name: 'Access Key Id', value: credentials.aws.accessKeyId },
    { name: 'Secret Access Key', value: '*****REDACTED****' },
  ]
)

export function AwsForm() {
  const [workspace, setWorkspace] = usePersistedWorkspace()
  const [credentials, setCredentials] = usePersistedCredentials()
  const aws = useMemo(() => credentials.aws || {}, [credentials])

  const update = useCallback((field, val) => (
    setCredentials(x => ({
      ...(x || {}),
      aws: {
        ...x.aws,
        [field]: val,
      },
    }))
  ), [setCredentials])

  const setRegion = useCallback(r => {
    setWorkspace(x => ({
      ...(x || {}),
      region: r,
    }))
  }, [setWorkspace])

  const region = workspace.region || 'us-east-2'

  useEffect(() => {
    if (!workspace.region) setRegion(region)
  }, [aws, region, setRegion, workspace])

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
        label="Access Key ID"
      >
        <Input
          width="100%"
          value={aws.accessKeyId || ''}
          onChange={event => update('accessKeyId', event.target.value)}
        />
      </FormField>
      <FormField
        width="100%"
        label="Secret Access Key"
      >
        <Input
          width="100%"
          value={aws.secretAccessKey || ''}
          onChange={event => update('secretAccessKey', event.target.value)}
        />
      </FormField>
    </>
  )
}
