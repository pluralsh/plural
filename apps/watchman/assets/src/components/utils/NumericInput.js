import React, { useState } from 'react'
import { Box, TextInput } from 'grommet'
import { FormNext, FormPrevious } from 'grommet-icons'
import { SecondaryButton } from './Button'

const ICON_SIZE = '20px'

function Toggle({direction, current, setCurrent}) {
  return (
    <SecondaryButton
      pad='xsmall'
      round='xsmall'
      align='center'
      justify='center'
      onClick={() => direction === 'up' ? setCurrent(current + 1) : setCurrent(current - 1)}
      icon={direction === 'up' ? <FormNext size={ICON_SIZE} /> :
                                  <FormPrevious size={ICON_SIZE} />} />
  )
}

function estimateWidth(current) {
  const len = ('' + current).length - 1
  return 35 + (len * 10)
}

export default function NumericInput({value, onChange, ...rest}) {
  const [current, setCurrent] = useState(value || 0)

  function updateValue(current) {
    onChange(current)
    setCurrent(current)
  }

  return (
    <Box direction='row' gap='xsmall' align='center' {...rest}>
      <Toggle direction='down' current={current} setCurrent={updateValue} />
      <Box width={`${estimateWidth(current)}px`}>
        <TextInput value={current + ''} onChange={({target: {value}}) => {
          const parsed = parseInt(value)
          if (!isNaN(parsed)) {
            updateValue(parsed)
          }
        }} />
      </Box>
      <Toggle direction='up' current={current} setCurrent={updateValue} />
    </Box>
  )
}