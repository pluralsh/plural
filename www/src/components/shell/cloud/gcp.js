import { useCallback, useContext, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { File } from 'forge-core'

import { AttachmentContext, AttachmentProvider, Dropzone } from '../../incidents/AttachmentProvider'
import { DarkSelect } from '../../utils/DarkSelect'
import { stringExists, isAlphanumeric } from '../validation'

const ZONES = [
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast2',
  'asia-northeast3',
  'asia-south1',
  'asia-southeast1',
  'australia-southeast1',
  'asia-northeast1',
  'europe-central2',
  'europe-west2',
  'europe-west3',
  'us-east1',
  'us-west1',
  'us-west2',
]

export const GCP_VALIDATIONS = [
  { field: 'credentials.gcp.applicationCredentials', func: stringExists, name: 'application credentials' },
  { field: 'workspace.project', func: isAlphanumeric, name: 'project' },
]

export const gcpSynopsis = ({ workspace }) => (
  [
    { name: 'Region', value: workspace.region },
    { name: 'Application Credentials', value: '*****REDACTED****' },
    { name: 'Project', value: workspace.project },
  ]
)

function FileInput({ updateCreds, gcp, setProject }) {
  const { attachment } = useContext(AttachmentContext)
  useEffect(() => {
    if (!attachment) return

    const reader = new FileReader()
    reader.onload = ({ target: { result } }) => {
      try {
        const creds = JSON.parse(result)
        setProject(creds.project_id)
        updateCreds('applicationCredentials', result)
      }
      catch (error) {
        //
      }
    }
    reader.readAsText(attachment)
  }, [attachment, setProject, updateCreds])

  const loaded = !!gcp.applicationCredentials

  return (
    <Box
      fill="horizontal"
      height="200px"
      align="center"
      justify="center"
      border={{ side: 'all', color: gcp.applicationCredentials ? 'brand' : 'border' }}
      round="xsmall"
    >
      <File
        size="25px"
        color={loaded ? 'brand' : null}
      />
      <Text size="small">drop your service account credentials here</Text>
    </Box>
  )
}

export function GcpForm({ workspace, setWorkspace, credentials, setCredentials }) {
  const gcp = credentials.gcp || {}
  const updateCreds = useCallback((field, val) => (
    setCredentials({ ...credentials, gcp: { ...credentials.gcp, [field]: val } })
  ), [setCredentials, credentials])
  const setRegion = useCallback(r => setWorkspace({ ...workspace, region: r }), [setWorkspace, workspace])
  const setProject = useCallback(p => setWorkspace({ ...workspace, project: p }), [setWorkspace, workspace])
  const region = workspace.region || 'us-east1'

  useEffect(() => {
    if (!workspace.region) setRegion(region)
  }, [workspace.region, region, setRegion])

  return (
    <Box
      fill
      gap="small"
    >
      <Box
        flex={false}
        fill="horizontal"
        direction="row"
        gap="xsmall"
        align="center"
      >
        <Text
          weight={500}
          size="small"
        >Zone:
        </Text>
        <Box fill="horizontal">
          <DarkSelect
            size="small"
            value={{ value: region, label: region }}
            options={ZONES.map(r => ({ value: r, label: r }))}
            onChange={({ value }) => setRegion(value)}
          />
        </Box>
      </Box>
      <AttachmentProvider>
        <Dropzone>
          <FileInput
            updateCreds={updateCreds}
            gcp={gcp}
            setProject={setProject}
          />
        </Dropzone>
      </AttachmentProvider>
    </Box>
  )
}
