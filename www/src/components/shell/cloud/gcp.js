import React, { useCallback, useContext, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { File } from 'forge-core'
import { AttachmentContext, AttachmentProvider, Dropzone } from '../../incidents/AttachmentProvider'
import { LabelledInput } from '../../users/MagicLogin'
import { DarkSelect } from '../../utils/DarkSelect'
import { exists, isAlphanumeric } from '../validation'

const ZONES = [
  'asia-east1-a',
  'asia-east1-b',
  'asia-east1-c',
  'asia-east2-a',
  'asia-east2-b',
  'asia-east2-c',
  'asia-northeast1-a',
  'asia-northeast1-b',
  'asia-northeast1-c',
  'asia-northeast2-a',
  'asia-northeast2-b',
  'asia-northeast2-c',
  'asia-northeast3-a',
  'asia-northeast3-b',
  'asia-northeast3-c',
  'asia-south1-a',
  'asia-south1-b',
  'asia-south1-c',
  'asia-southeast1-a',
  'asia-southeast1-b',
  'asia-southeast1-c',
  'australia-southeast1-a',
  'australia-southeast1-b',
  'australia-southeast1-c',
  'asia-northeast1-a',
  'asia-northeast1-b',
  'asia-northeast1-c',
  'europe-central2-a',
  'europe-central2-b',
  'europe-central2-c',
  'europe-west2-a',
  'europe-west2-b',
  'europe-west2-c',
  'europe-west3-a',
  'europe-west3-b',
  'europe-west3-c',
  'us-east1-b',
  'us-east1-c',
  'us-east1-d',
  'us-west1-a',
  'us-west1-b',
  'us-west1-c',
  'us-west2-a',
  'us-west2-b',
  'us-west2-c',
]

export const GCP_VALIDATIONS = [
  {field: 'credentials.gcp.applicationCredentials', func: exists, name: 'application credentials'},
  {field: 'workspace.project', func: isAlphanumeric, name: 'project'}
]

export const gcpSynopsis = ({workspace}) => (
  [
    {name: "Region", value: workspace.region},
    {name: 'Application Credentials', value: '*****REDACTED****'},
    {name: 'Project', value: workspace.project}
  ]
)

function FileInput({updateCreds, gcp, setProject}) {
  const {attachment} = useContext(AttachmentContext)
  useEffect(() => {
    if (!attachment) return

    var reader = new FileReader();
    reader.onload = function({target: {result}}) {
      try {
        const creds = JSON.parse(result)
        setProject(creds.project_id)
        updateCreds('applicationCredentials', result)
      } catch {}
    };
    reader.readAsText(attachment)
  }, [attachment])

  const loaded = !!gcp.applicationCredentials

  return (
    <Box fill='horizontal' height='200px' align='center' justify='center' 
         border={{side: 'all', color: gcp.applicationCredentials ? 'brand' : 'border'}} round='xsmall'>
      <File size='25px' color={loaded ? 'brand' : null} />
      <Text size='small'>drop your service account credentials here</Text>
    </Box>
  )
}

export function GcpForm({workspace, setWorkspace, credentials, setCredentials}) {
  const gcp = credentials.gcp || {}
  const updateCreds = useCallback((field, val) => (
    setCredentials({...credentials, gcp: {...credentials.gcp, [field]: val}})
  ), [setCredentials, credentials])
  const setRegion = useCallback((r) => setWorkspace({...workspace, region: r}), [setWorkspace, workspace])
  const setProject = useCallback((p) => setWorkspace({...workspace, project: p}), [setWorkspace, workspace])
  const region = workspace.region || 'us-east1-b'
  
  useEffect(() => {
    !workspace.region && setRegion(region)
  }, [workspace.region, region, setRegion])

  return (
    <Box fill gap='small'>
      <Box flex={false} fill='horizontal' direction='row' gap='xsmall' align='center'>
        <Text weight={500} size='small'>Zone:</Text>
        <Box fill='horizontal'>
          <DarkSelect
            size='small'
            value={{value: region, label: region}}
            options={ZONES.map((r) => ({value: r, label: r}))}
            onChange={({value}) => setRegion(value)} />
        </Box>
      </Box>
      <AttachmentProvider>
        <Dropzone>
          <FileInput 
            updateCreds={updateCreds} 
            gcp={gcp}
            setProject={setProject} />
        </Dropzone>
      </AttachmentProvider>
    </Box>
  )
}