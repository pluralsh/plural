import { useCallback, useEffect, useMemo } from 'react'
import { MenuItem, Select } from 'honorable'

import { FormField, Input } from '../design-system/src'

import { stringExists } from '../../validation'

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

export const AWS_VALIDATIONS = [
  {
    field: 'workspace.region',
    func: stringExists,
    name: 'Region',
  },
  {
    field: 'credentials.aws.accessKeyId',
    func: stringExists,
    name: 'Access Key ID',
  },
  {
    field: 'credentials.aws.secretAccessKey',
    func: stringExists,
    name: 'Secret Access Key',
  },
]

export function AwsForm({
  credentials, setCredentials, workspace, setWorkspace,
}: any) {
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
