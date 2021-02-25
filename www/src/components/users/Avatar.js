import React from 'react'
import { Box, Text } from 'grommet'

export function initials(name) {
  return name
          .split(' ')
          .map((n) => n.charAt(0).toUpperCase())
          .join('')
}

export default function Avatar({size, user, round}) {
  return (
    <Box
      flex={false}
      round={round || 'xsmall'}
      style={user.avatar ? {backgroundImage: `url(${user.avatar})`, backgroundPosition: 'center', backgroundSize: 'cover'} : null}
      align='center'
      justify='center'
      width={size}
      height={size}
      background={!user.avatar ? user.backgroundColor : null}>
      {!user.avatar && <Text>{initials(user.name)}</Text>}
    </Box>
  )
}