import React from 'react'
import { Box, Text } from 'grommet'
import Avatar from '../users/Avatar'

export function UserRow({user, next, noborder}) {
  return (
    <Box fill='horizontal' pad='small' direction='row' align='center' gap='small' 
         border={next && !noborder ? {side: 'bottom', color: 'light-6'} : null}>
      <Avatar user={user} size='50px' />
      <Box>
        <Text size='small' weight='bold' >{user.email}</Text>
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}