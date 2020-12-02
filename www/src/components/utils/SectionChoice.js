import React, { useState } from 'react'
import { Box, Text } from 'grommet'

export function SectionChoice({label, selected, icon, onClick}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      border={{color: (selected || hover) ? 'focus' : 'light-5'}}
      focusIndicator={false}
      hoverIndicator='backgroundDark'
      direction='row'
      align='center'
      gap='small'
      pad='small'
      round='xsmall'
      onClick={onClick}>
      {icon}
      <Text size='small' weight={500}>{label}</Text>
    </Box>
  )
}