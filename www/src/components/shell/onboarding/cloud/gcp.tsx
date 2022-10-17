import {
  useCallback, useContext, useEffect, useState,
} from 'react'
import {
  Flex, MenuItem, Select, Text,
} from 'honorable'
import { FileIcon, FormField } from 'pluralsh-design-system'
import usePrevious from 'hooks/usePrevious'
import { useTheme } from 'styled-components'

import {
  AttachmentContext,
  AttachmentProvider,
  Dropzone,
} from '../../../incidents/AttachmentProvider'
import { isAlphanumeric, stringExists } from '../../validation'

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
  // Seems to be getting stuck in infinite loop when file is uploaded
  const { attachment } = useContext(AttachmentContext) as any
  const prevAttachment = usePrevious(attachment)
  const theme = useTheme()
  const [uploadError, setUploadError] = useState(false)
  const loaded = !!gcp.applicationCredentials

  const resetCreds = useCallback(() => {
    setProject(undefined)
    updateCreds('applicationCredentials', undefined)
  }, [updateCreds, setProject])

  useEffect(() => {
    if (!attachment || attachment === prevAttachment) return
    setUploadError(false)
    const reader = new FileReader()

    reader.onload = ({ target }) => {
      if (typeof target?.result === 'string') {
        const { result } = target

        try {
          const creds = JSON.parse(result)

          setProject(creds.project_id)
          updateCreds('applicationCredentials', result)
        }
        catch (error) {
          setUploadError(true)
          resetCreds()
        }
      }
    }
    reader.onerror = () => {
      setUploadError(true)
      resetCreds()
    }
    reader.readAsText(attachment)
  }, [
    attachment,
    prevAttachment,
    setProject,
    setUploadError,
    updateCreds,
    resetCreds,
  ])

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
        color={loaded ? 'icon-success' : uploadError ? 'icon-error' : 'text'}
      />
      <Text
        body1
        bold
        marginTop="medium"
        maxWidth={230}
      >
        Drop your service account credentials here
      </Text>
      {uploadError && (
        <Text
          body2
          color={theme.colors['text-error']}
          marginTop={theme.spacing.xsmall}
        >
          Problem uploading credentials. Please try again.
        </Text>
      )}
    </Flex>
  )
}

export function GcpForm({
  workspace,
  setWorkspace,
  credentials,
  setCredentials,
}) {
  const gcp = credentials.gcp || {}
  const updateCreds = useCallback((field, val) => setCredentials({
    ...credentials,
    gcp: { ...credentials.gcp, [field]: val },
  }),
  [setCredentials, credentials])
  const setRegion = useCallback(r => setWorkspace({ ...workspace, region: r }),
    [setWorkspace, workspace])
  const setProject = useCallback(p => setWorkspace({ ...workspace, project: p }),
    [setWorkspace, workspace])
  const region = workspace.region || 'us-east1'
  const credsLoaded = !!gcp.applicationCredentials

  useEffect(() => {
    if (!workspace.region) setRegion(region)
  }, [workspace.region, region, setRegion])

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
          <Dropzone loaded={credsLoaded}>
            <FileInput
              updateCreds={updateCreds}
              gcp={gcp}
              setProject={setProject}
            />
          </Dropzone>
        </AttachmentProvider>
      </FormField>
    </>
  )
}
