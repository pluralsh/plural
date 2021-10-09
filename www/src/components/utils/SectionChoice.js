import React from 'react'
import { Box, Text } from 'grommet'
import { SIDEBAR_ICON_HEIGHT } from '../Sidebar'

export function SectionChoice({label, selected, icon, onClick}) {
  return (
    <Box background={selected ? '#000' : null} focusIndicator={false}
      hoverIndicator='#000' direction='row' align='center' gap='small'
      round='xsmall' pad={{horizontal: 'small'}} height={SIDEBAR_ICON_HEIGHT} onClick={onClick}>
      {icon}
      <Box fill='horizontal'>
        <Text size='small'>{label}</Text>
      </Box>
    </Box>
  )
}