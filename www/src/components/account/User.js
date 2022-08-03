import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import {
  Avatar, Button, MenuItem, Span,
} from 'honorable'
import { BotIcon } from 'pluralsh-design-system'
import { useContext, useState } from 'react'

import { fetchToken, setPreviousUserData, setToken } from '../../helpers/authentication'

import { canEdit } from '../accounts/EditAccount'
import { EDIT_USER, IMPERSONATE_SERVICE_ACCOUNT } from '../accounts/queries'
import { Permissions } from '../accounts/types'
import { CurrentUserContext } from '../login/CurrentUser'

import { Provider } from '../repos/misc'
import { DELETE_USER } from '../users/queries'
import { GraphQlToast } from '../utils/Toasts'

import { Confirm } from './Confirm'
import { EditServiceAccount } from './CreateServiceAccount'

import { MoreMenu } from './MoreMenu'
import { hasRbac } from './utils'

export function UserInfo({ user: { email, name, avatar }, ...box }) {
  return (
    <Box
      {...box}
      direction="row"
      gap="small"
      align="center"
    >
      <Avatar
        src={avatar}
        name={name}
        size={40}
      />
      <Box>
        <Span fontWeight="bold">{name}</Span>
        <Span color="text-light">{email}</Span>
      </Box>
    </Box>
  )
}

export function Chip({ text, color }) {
  return (
    <Box
      round="3px"
      align="center"
      justify="center"
      pad={{ horizontal: '12px', vertical: '8px' }}
      background="fill-two"
    >
      <Span
        color={color || 'action-link-inline'}
        fontWeight="bold"
      >{text}
      </Span>
    </Box>
  )
}

function UserEdit({ user, update }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation] = useMutation(EDIT_USER, {
    variables: { id: user.id },
  })
  const [deleteMut, { loading, error }] = useMutation(DELETE_USER, {
    variables: { id: user.id },
    update,
    onCompleted: () => setConfirm(false),
  })
  const isAdmin = !!user.roles?.admin

  return (
    <>
      <MoreMenu>
        <MenuItem onClick={() => mutation({ variables: { attributes: { roles: { admin: !isAdmin } } } })}>
          <Span color="text-light">{isAdmin ? 'Remove admin role' : 'Add admin role'}</Span>
        </MenuItem>
        <MenuItem onClick={() => setConfirm(true)}>
          <Span color="text-error">Delete user</Span>
        </MenuItem>
      </MoreMenu>
      <Confirm
        open={confirm}
        close={() => setConfirm(false)}
        error={error}
        title="Confirm deletion"
        text="Be sure this user has no active installations before deleting"
        label="Delete"
        destructive
        submit={deleteMut}
        loading={loading}
      />
    </>
  )
}

export function User({ user, update }) {
  const { account, ...me } = useContext(CurrentUserContext)
  console.log(me)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)

  return (
    <Box
      fill="horizontal"
      direction="row"
      align="center"
    >
      <UserInfo
        fill="horizontal"
        user={user}
      />
      <Box
        flex={false}
        direction="row"
        gap="24px"
        align="center"
      >
        {user.provider && (
          <Provider
            provider={user.provider}
            width={25}
          />
        )}
        {user.roles?.admin && <Chip text="Admin" />}
        {account.rootUser.id === user.id && <Chip text="Root" />}
        {editable && (
          <UserEdit
            user={user}
            update={update}
          />
        )}
      </Box>
    </Box>
  )
}

export function ServiceAccount({ user, update }) {
  const { account, ...me } = useContext(CurrentUserContext)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, {
    variables: { id: user.id },
    update: (_cache, { data: { impersonateServiceAccount: { jwt } } }) => {
      setPreviousUserData({
        me,
        jwt: fetchToken(),
      })
      setToken(jwt)
      window.location = '/'
    },
  })

  return (
    <>
      <Box
        fill="horizontal"
        direction="row"
        align="center"
      >
        <UserInfo
          user={user}
          fill="horizontal"
        />
        <Box
          flex={false}
          direction="row"
          gap="24px"
          align="center"
        >
          {user.provider && (
            <Provider
              provider={user.provider}
              width={25}
            />
          )}
          <Button
            small
            secondary
            startIcon={<BotIcon size={15} />}
            onClick={mutation}
          >
            Impersonate
          </Button>
          {editable && (
            <EditServiceAccount
              user={user}
              update={update}
            />
          )}
        </Box>
      </Box>
      {error && (
        <GraphQlToast
          error={error}
          header="Failed to impersonate"
        />
      )}
    </>
  )
}
