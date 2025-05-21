import {
  EyeClosedIcon,
  EyeIcon,
  IconFrame,
  Input2,
} from '@pluralsh/design-system'

import { ComponentProps, useState } from 'react'
import styled from 'styled-components'

const IconFrameStyled = styled(IconFrame)(({ theme }) => ({
  marginRight: -theme.spacing.medium + 3,
  color: theme.colors['icon-light'],
}))

export function InputRevealer({
  inputProps,
  defaultRevealed = false,
  ...props
}: { defaultRevealed?: boolean } & ComponentProps<typeof Input2>) {
  const [showInput, setShowInput] = useState(defaultRevealed)

  return (
    <Input2
      inputProps={{
        ...inputProps,
        type: showInput ? 'text' : 'password',
      }}
      endIcon={
        <IconFrameStyled
          size="medium"
          tooltip={showInput ? 'Hide' : 'Reveal'}
          clickable
          icon={showInput ? <EyeIcon /> : <EyeClosedIcon />}
          onClick={() => setShowInput((last) => !last)}
        />
      }
      {...props}
    />
  )
}
