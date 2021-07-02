import React from 'react'
import { Box, Text } from 'grommet'

export function SearchIcon({border, size}) {
  return (
    <Box flex={false} width={`${size + 10}px`} height={`${size + 10}px`}  pad='small' 
         border={{side: 'all', color: border}} align='center' justify='center'>
      <Text size={`${size}px`} color={border}>/</Text>
    </Box>
  )
}