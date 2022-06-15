import { useCallback, useEffect, useMemo } from 'react'
import { MenuItem, Select } from 'honorable'
import { FormField, Input } from 'pluralsh-design-system'

import { stringExists } from '../../validation'

const REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-2',
  'eu-west-1',
]

export const AWS_VALIDATIONS = [
  { field: 'credentials.aws.accessKeyId', func: stringExists, name: 'access key id' },
  { field: 'credentials.aws.secretAccessKey', func: stringExists, name: 'secret access key' },
]

export const awsSynopsis = ({ workspace, credentials }) => (
  [
    { name: 'Region', value: workspace.region },
    { name: 'Access Key Id', value: credentials.aws.accessKeyId },
    { name: 'Secret Access Key', value: '*****REDACTED****' },
  ]
)

export function AwsForm({ credentials, setCredentials, workspace, setWorkspace }) {
  const aws = useMemo(() => credentials.aws || {}, [credentials])

  const update = useCallback((field, val) => (
    setCredentials({ ...credentials, aws: { ...credentials.aws, [field]: val } })
  ), [setCredentials, credentials])
  const setRegion = useCallback(r => setWorkspace({ ...workspace, region: r }), [setWorkspace, workspace])
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
          onChange={({ target: { value } }) => update('accessKeyId', value)}
        />
      </FormField>
      <FormField
        width="100%"
        label="Secret Access Key"
      >
        <Input
          width="100%"
          value={aws.secretAccessKey || ''}
          onChange={({ target: { value } }) => update('secretAccessKey', value)}
        />
      </FormField>
    </>
  )
}
