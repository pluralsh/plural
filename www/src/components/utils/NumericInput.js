import { useState } from 'react'
import { Box, TextInput } from 'grommet'

function estimateWidth(current) {
  const len = (`${current}`).length - 1

  return 35 + (len * 10)
}

export function NumericInput({ value, onChange, ...rest }) {
  const [current, setCurrent] = useState(value || 0)
  const [blur, setBlur] = useState(false)

  function updateValue(current) {
    onChange(current)
    setCurrent(current)
  }

  return (
    <Box
      direction="row"
      gap="xsmall"
      align="center"
      {...rest}
    >
      <Box
        width={`${estimateWidth(current)}px`}
        border={blur ? { color: 'brand', side: 'bottom' } : 'bottom'}
      >
        <TextInput
          onBlur={() => setBlur(false)}
          onFocus={() => setBlur(true)}
          plain
          value={`${current}`}
          onChange={({ target: { value } }) => {
            const parsed = parseInt(value)
            if (parsed === parsed) {
              updateValue(parsed)
            }
          }}
        />
      </Box>
    </Box>
  )
}
