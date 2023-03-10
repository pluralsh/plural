import { ComponentProps, useCallback, useState } from 'react'
import { Span } from 'honorable'
import { FileInput, ThemeContext } from 'grommet'
import { useTheme } from 'styled-components'

import { fileInputTheme } from '../../../../utils/fileInputTheme'

export default function ConfigurationFileInput({
  value,
  onChange, ...props
}: { onChange: (f:{file: File | null, text: string}) => void; value: string } & Omit<
  ComponentProps<typeof FileInput>, 'onChange'
>) {
  const [fileSelected, setFileSelected] = useState<boolean>(!!value)
  const theme = useTheme()

  const readFile = useCallback(async (files: FileList | undefined | null) => {
    setFileSelected(false)

    const file = files?.item(0) ?? null
    const text = await file?.text() ?? ''

    setFileSelected(!!file)
    onChange({ text, file })
  },
  [onChange])

  const messages = value ? { dropPrompt: '********', browse: 'Choose a different file' } : {
    dropPrompt: 'Drop your file here',
    browse: 'Select file',
  }

  return (
    <ThemeContext.Extend value={fileInputTheme({ selected: fileSelected, theme })}>
      <FileInput
        messages={messages}
        multiple={false}
        onChange={event => readFile(event?.target?.files)}
        renderFile={file => (
          <Span
            margin="small"
            color="text-light"
          >
            {file.name}
          </Span>
        )}
        {...props}
      />
    </ThemeContext.Extend>
  )
}
