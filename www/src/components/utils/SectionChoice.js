import React from 'react'
import { Box, Text } from 'grommet'

export function SectionChoice({label, selected, icon, onClick}) {
  return (
    <Box border={{color: selected ? 'focus' : 'light-5'}} focusIndicator={false}
      hoverIndicator='light-3' direction='row' align='center' gap='small'
      round='xsmall' pad={{horizontal: 'small', vertical: 'xsmall'}} onClick={onClick}>
      <Box fill='horizontal'>
        <Text size='small'>{label}</Text>
      </Box>
      {icon}
    </Box>
  )
}