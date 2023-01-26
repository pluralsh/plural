import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Div, Span } from 'honorable'
import IsEmpty from 'lodash/isEmpty'
import {
  CloseIcon,
  FormField,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import { FileInput } from 'grommet'
import { ThemeContext } from 'grommet/contexts'

import { OnboardingContext } from '../../../context/onboarding'
import { IsObjectEmpty } from '../../../../../../utils/object'
import { CloudProvider, GCPCloudProvider } from '../../../context/types'
import { useSetCloudProviderKeys, useSetWorkspaceKeys } from '../../../context/hooks'

const REGIONS = [
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

enum FileError {
  InvalidFormat = 'Invalid file format. Expected JSON.',
  InvalidContent = 'Invalid file content. Could not find \'project_id\'.',
}

function fileInputTheme(selected, error) {
  return {
    fileInput: {
      hover: {
        border: {
          color: error ? 'error' : selected ? 'success' : 'selected',
        },
      },
      border: {
        color: error ? 'error' : selected ? 'success' : 'fill-three',
      },
      icons: {
        remove: CloseIcon,
      },
    },
  }
}

function GCP() {
  const { cloud, setValid, workspace } = useContext(OnboardingContext)
  const setCloudProviderKeys = useSetCloudProviderKeys<GCPCloudProvider>(CloudProvider.GCP)
  const setWorkspaceKeys = useSetWorkspaceKeys()
  const [fileSelected, setFileSelected] = useState<boolean>(!!cloud?.gcp?.fileName)
  const [fileError, setFileError] = useState<FileError>()
  const isValid = useMemo(() => !IsObjectEmpty(cloud?.gcp) && !IsObjectEmpty(workspace), [cloud, workspace])

  const readFile = useCallback(async (files: FileList | undefined | null) => {
    setFileSelected(false)
    setFileError(undefined)
    setCloudProviderKeys({ applicationCredentials: undefined, fileName: undefined })
    setWorkspaceKeys({ project: undefined })

    if (files?.length === 0) return

    const file = files?.item(0)

    if (file?.type !== 'application/json') {
      setFileError(FileError.InvalidFormat)

      return
    }

    const content = await file?.text()
    const credentials = JSON.parse(content)

    if (!credentials.project_id) {
      setFileError(FileError.InvalidContent)

      return
    }

    setFileSelected(true)
    setWorkspaceKeys({ project: credentials.project_id })
    setCloudProviderKeys({ applicationCredentials: content, fileName: file.name })
  }, [setCloudProviderKeys, setWorkspaceKeys])

  useEffect(() => setValid(isValid), [isValid, setValid])
  useEffect(() => (IsEmpty(workspace?.region) ? setWorkspaceKeys({ region: 'us-east1' }) : undefined), [setWorkspaceKeys, workspace])

  return (
    <>
      <FormField label="Region">
        <Select
          selectedKey={workspace?.region}
          onSelectionChange={value => setWorkspaceKeys({ region: `${value}` })}
          maxHeight={200}
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
      <FormField label="Service account credentials">
        <ThemeContext.Extend value={fileInputTheme(fileSelected, !!fileError)}>
          <FileInput
            value={cloud?.gcp?.fileName ? [{ name: cloud?.gcp?.fileName }] as any : undefined}
            messages={{
              dropPrompt: 'Drop your service account credentials file here',
              browse: 'Select file',
            }}
            onChange={event => readFile(event?.target?.files)}
            renderFile={file => (
              <Span
                margin="small"
                color="text-light"
              >{file?.name}
              </Span>
            )}
          />
        </ThemeContext.Extend>
        {!!fileError && (
          <Div
            marginTop="xxsmall"
            fontSize="small"
            color="error"
          >{fileError}
          </Div>
        )}
      </FormField>
    </>
  )
}

export default GCP
export { REGIONS }
