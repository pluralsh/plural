import React, { useContext } from 'react'
import { Box, Text } from 'grommet'
import Avatar from '../users/Avatar'
import { DeleteUser } from '../users/DeleteUser'
import { Provider } from '../repos/misc'
import Toggle from 'react-toggle'
import { useMutation } from 'react-apollo'
import { EDIT_USER } from './queries'
import { CurrentUserContext } from '../login/CurrentUser'

export function UserRow({user, next, noborder, deletable, update}) {
  const admin = user.roles && user.roles.admin
  const {account} = useContext(CurrentUserContext)
  const [mutation] = useMutation(EDIT_USER, {
    variables: {id: user.id}
  })

  console.log(account)

  return (
    <Box fill='horizontal' pad='small' direction='row' align='center' gap='small' 
         border={next && !noborder ? {side: 'bottom', color: 'light-6'} : null}>
      <Avatar user={user} size='50px' />
      <Box fill='horizontal'>
        <Box direction='row' gap='xsmall' align='center'>
          <Text size='small' weight='bold' >{user.email}</Text>
          {account.rootUser.id === user.id && <Text size='small' color='dark-3'>root user</Text>}
        </Box>
        <Text size='small'>{user.name}</Text>
      </Box>
      {user.provider && <Provider provider={user.provider} width={40} />}
      <Box fill='horizontal' direction='row' align='center' justify='end'>
        <Box flex={false} direction='row' align='center' gap='xsmall'>
          <Toggle
            checked={!!admin}
            onChange={({target: {checked}}) => mutation({variables: {attributes: {roles: {admin: !!checked}}}})} />
          <Text size='small'>admin</Text>
        </Box>
      </Box>
      {deletable && <DeleteUser id={user.id} update={update} />}
    </Box>
  )
}