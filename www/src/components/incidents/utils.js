import React from 'react'
import { Box, Text } from 'grommet'

export function Attribute({name, children, size}) {
  return (
    <Box direction='row' align='center' fill='horizontal' pad='small'>
      <Box width={size || '80px'}>
        <Text size='small' weight='bold'>{name}</Text>
      </Box>
      <Box fill='horizontal'>
        {children}
      </Box>
    </Box>
  )
}

export function Attributes({children}) {
  return (
    <Box border={{color: 'light-5'}} round='xsmall'>
      <Box gap='0px' border={{side: 'between', color: 'light-5'}}>
        {children}
      </Box>
    </Box>
  )
}