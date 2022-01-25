import React, { useCallback, useEffect } from 'react'
import { LabelledInput } from '../../users/MagicLogin'
import { Box, Text } from 'grommet'
import { DarkSelect } from '../../utils/DarkSelect'
import { exists } from '../validation'
import { Provider } from '../../repos/misc'

const REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-2',
  'eu-west-1'
]

export const AWS_VALIDATIONS = [
  {field: 'credentials.aws.accessKeyId', func: exists, name: 'access key id'},
  {field: 'credentials.aws.secretAccessKey', func: exists, name: 'secret access key'}
]

export function AwsForm({credentials, setCredentials, workspace, setWorkspace}) {
  const aws = credentials.aws || {}
  const update = useCallback((field, val) => (
    setCredentials({...credentials, aws: {...credentials.aws, [field]: val}})
  ), [setCredentials, credentials])
  const setRegion = useCallback((r) => setWorkspace({...workspace, region: r}), [setWorkspace, workspace])
  const region = workspace.region || 'us-east-2'

  useEffect(() => {
    !workspace.region && setRegion(region)
  }, [aws, region, setRegion])

  return (
    <Box gap='small'>
      <Box flex={false} fill='horizontal' direction='row' gap='small' align='center'>
        <Text weight={500} size='small'>Provider</Text>
        <Provider provider='AWS' width={50} />
      </Box>
      <Box flex={false} fill='horizontal' direction='row' gap='xsmall' align='center'>
        <Text weight={500} size='small'>Region:</Text>
        <Box fill='horizontal'>
          <DarkSelect
            size='small'
            value={{value: region, label: region}}
            options={REGIONS.map((r) => ({value: r, label: r}))}
            onChange={({value}) => setRegion(value)} />
        </Box>
      </Box>
      <LabelledInput 
        label='Access Key Id' 
        width='100%'
        value={aws.accessKeyId || ''}
        onChange={(value) => update('accessKeyId', value)} />
      <LabelledInput 
        label='Secret Access Key' 
        width='100%'
        value={aws.secretAccessKey || ''}
        onChange={(value) => update('secretAccessKey', value)} />
    </Box>
  )
}