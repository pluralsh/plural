import React from 'react'
import { Box, Text } from 'grommet'
import Avatar from '../users/Avatar'
import { DeleteUser } from '../users/DeleteUser'

export function UserRow({user, next, noborder, deletable, update}) {
  return (
    <Box fill='horizontal' pad='small' direction='row' align='center' gap='small' 
         border={next && !noborder ? {side: 'bottom', color: 'light-6'} : null}>
      <Avatar user={user} size='50px' />
      <Box fill='horizontal'>
        <Text size='small' weight='bold' >{user.email}</Text>
        <Text size='small'>{user.name}</Text>
      </Box>
      {deletable && <DeleteUser id={user.id} update={update} />}
    </Box>
  )
}