import { useContext } from 'react'
import { Box, Text } from 'grommet'

import Toggle from 'react-toggle'

import { useMutation } from '@apollo/client'

import Avatar from '../users/Avatar'
import { DeleteUser } from '../users/DeleteUser'
import { Provider } from '../repos/misc'

import { CurrentUserContext } from '../login/CurrentUser'

import { EDIT_USER } from './queries'
import { canEdit } from './EditAccount'

export function UserRow({ user, next, noborder, notoggle, deletable, update }) {
  const admin = user.roles && user.roles.admin
  const { account, ...me } = useContext(CurrentUserContext)
  const [mutation] = useMutation(EDIT_USER, {
    variables: { id: user.id },
  })

  return (
    <Box
      fill="horizontal"
      pad="small"
      direction="row"
      align="center"
      gap="small"
      border={next && !noborder ? { side: 'bottom', color: 'border' } : null}
    >
      <Avatar
        user={user}
        size="50px"
      />
      <Box fill="horizontal">
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            size="small"
            weight="bold"
          >{user.email}
          </Text>
          {account.rootUser.id === user.id && (
            <Text
              size="small"
              color="dark-3"
            >(root user)
            </Text>
          )}
        </Box>
        <Text size="small">{user.name}</Text>
      </Box>
      {user.provider && (
        <Provider
          provider={user.provider}
          width={40}
        />
      )}
      {!notoggle && (
        <Box
          flex={false}
          direction="row"
          align="center"
          gap="xsmall"
          margin={{ left: 'small' }}
        >
          <Toggle
            checked={!!admin}
            disabled={!canEdit(me, account)}
            onChange={({ target: { checked } }) => mutation({ variables: { attributes: { roles: { admin: !!checked } } } })}
          />
          <Text size="small">admin</Text>
        </Box>
      )}
      {deletable && (
        <DeleteUser
          id={user.id}
          update={update}
        />
      )}
    </Box>
  )
}
