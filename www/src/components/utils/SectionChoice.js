import React from 'react'
import { Box, Text } from 'grommet'

export function SectionChoice({label, selected, icon, onClick}) {
  return (
    <Box background={selected ? 'sidebar' : null} focusIndicator={false}
      hoverIndicator='sidebar' direction='row' align='center' gap='small'
      round='xsmall' pad='small' onClick={onClick}>
      {icon}
      <Box fill='horizontal'>
        <Text size='small'>{label}</Text>
      </Box>
    </Box>
  )
}