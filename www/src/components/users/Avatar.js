import React from 'react'
import { Box, Text } from 'grommet'

export function initials(name) {
  return name
          .split(' ')
          .map((n) => n.charAt(0).toUpperCase())
          .join('')
}

export default function Avatar({size, user}) {
  return (
    <Box
      flex={false}
      round='xsmall'
      align='center'
      justify='center'
      width={size}
      height={size}
      background={user.backgroundColor}>
      {user.avatar ?
        <img alt='my avatar' height={size} width={size} style={{borderRadius: '6px'}} src={user.avatar}/> :
        <Text>{initials(user.name)}</Text>
      }
    </Box>
  )
}