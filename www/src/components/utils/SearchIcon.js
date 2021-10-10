import React from 'react'
import { Box, Text } from 'grommet'

export function SearchIcon({border, color, size, pad}) {
  const padding = pad || 10
  return (
    <Box flex={false} width={`${size + padding}px`} height={`${size + padding}px`}
         border={{side: 'all', color: border}} align='center' justify='center'>
      <Text size={`${size}px`} color={color || border}>/</Text>
    </Box>
  )
}