import {
  useCallback,
  useContext,
  useEffect,
} from 'react'
import {
  Flex,
  MenuItem,
  Select,
  Text,
} from 'honorable'
import { FileIcon, FormField } from 'pluralsh-design-system'

import {
  AttachmentContext,
  AttachmentProvider,
  Dropzone,
} from '../../../incidents/AttachmentProvider'

import { usePersistedCredentials, usePersistedWorkspace } from '../../usePersistance'

const ZONES = [
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast2',
  'asia-northeast3',
  'asia-south1',
  'asia-southeast1',
  'australia-southeast1',
  'europe-central2',
  'europe-west2',
  'europe-west3',
  'us-east1',
  'us-west1',
  'us-west2',
]

export const gcpSynopsis = ({ workspace }) => (
  [
    { name: 'Region', value: workspace.region },
    { name: 'Application Credentials', value: '*****REDACTED****' },
    { name: 'Project', value: workspace.project },
  ]
)

function FileInput({ updateCreds, gcp, setProject }) {
  // Seems to be getting stuck in infinite loop when file is uploaded
  const { attachment } = useContext(AttachmentContext)as any

  useEffect(() => {
    if (!attachment) return

    const reader = new FileReader()

    reader.onload = ({ target: { result } }: any) => {
      try {
        const creds = JSON.parse(result)

        setProject(creds.project_id)
        updateCreds('applicationCredentials', result)
      }
      catch (error) {
         // TODO: show errors to user
        console.log('file error', error)
      }
    }
    reader.readAsText(attachment)
  }, [attachment, setProject, updateCreds])

  const loaded = !!gcp.applicationCredentials

  return (
    <Flex
      display="flex"
      direction="column"
      position="relative"
      minHeight={200}
      flex="1 1 100%"
      padding="xxlarge"
      alignItems="center"
      justify="center"
      textAlign="center"
    >
      <FileIcon
        size={48}
        color={loaded ? 'icon-success' : 'text'}
      />
      <Text
        body1
        bold
        marginTop="medium"
        maxWidth={230}
      >
        Drop your service account credentials here
      </Text>
    </Flex>
  )
}

export function GcpForm() {
  const [workspace, setWorkspace] = usePersistedWorkspace()
  const [credentials, setCredentials] = usePersistedCredentials()

  const gcp = credentials.gcp || {}

  const updateCreds = useCallback((field, value) => (
    setCredentials(x => ({
      ...(x || {}),
      gcp: {
        ...x.credentials.gcp,
        [field]: value,
      },
    }))
  ), [setCredentials])

  const setRegion = useCallback(region => {
    setWorkspace(x => ({
      ...(x || {}),
      region,
    }))
  }, [setWorkspace])

  const setProject = useCallback(project => {
    setWorkspace(x => ({
      ...(x || {}),
      project,
    }))
  }, [setWorkspace])

  const region = workspace.region || 'us-east1'

  useEffect(() => {
    if (!workspace.region) {
      setRegion(region)
    }
  }, [workspace.region, setRegion, region])

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
          {ZONES.map(zone => (
            <MenuItem
              key={zone}
              value={zone}
            >
              {zone}
            </MenuItem>
          ))}
        </Select>
      </FormField>
      <FormField
        width="100%"
        marginBottom="large"
        label="Service account credentials"
      >
        <AttachmentProvider>
          <Dropzone loaded={false}>
            <FileInput
              gcp={gcp}
              updateCreds={updateCreds}
              setProject={setProject}
            />
          </Dropzone>
        </AttachmentProvider>
      </FormField>
    </>
  )
}
