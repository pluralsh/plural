import { useCallback, useEffect, useState } from 'react'
import { FileInput } from 'grommet'
import { ThemeContext } from 'grommet/contexts'
import { Div, Span } from 'honorable'
import { FormField } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { fileInputTheme } from '../../../../../utils/fileInputTheme'

enum FileError {
  InvalidFormat = 'Invalid file format. Expected JSON.',
  InvalidContent = "Invalid file content. Could not find 'project_id'.",
}

function GCP({ setProps, setValid }) {
  const [fileSelected, setFileSelected] = useState<boolean>()
  const [fileError, setFileError] = useState<FileError>()

  const readFile = useCallback(
    async (files: FileList | undefined | null) => {
      setFileSelected(false)
      setFileError(undefined)
      setValid(false)
      setProps({ gcp: { applicationCredentials: '' } })

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
      setProps({ gcp: { applicationCredentials: content } })
      setValid(true)
    },
    [setProps, setValid]
  )

  // Init props provider object
  useEffect(() => {
    setProps({ gcp: { applicationCredentials: '' } })
  }, [setProps])

  const theme = useTheme()

  return (
    <FormField label="Service account credentials">
      <ThemeContext.Extend
        value={fileInputTheme({
          selected: fileSelected,
          error: !!fileError,
          theme,
        })}
      >
        <FileInput
          messages={{
            dropPrompt: 'Drop your service account credentials file here',
            browse: 'Select file',
          }}
          onChange={(event) => readFile(event?.target?.files)}
          renderFile={(file) => (
            <Span
              margin="small"
              color="text-light"
            >
              {file.name}
            </Span>
          )}
        />
      </ThemeContext.Extend>
      {!!fileError && (
        <Div
          marginTop="xxsmall"
          fontSize="small"
          color="error"
        >
          {fileError}
        </Div>
      )}
    </FormField>
  )
}

export default GCP
