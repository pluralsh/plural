import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Span } from 'honorable'
import {
  AppIcon,
  Chip,
  GraphQLToast,
  ListBoxItem,
} from 'pluralsh-design-system'
import { useContext, useState } from 'react'

import { fetchToken, setPreviousUserData, setToken } from '../../helpers/authentication'

import { canEdit } from '../users/EditAccount'
import CurrentUserContext from '../../contexts/CurrentUserContext'

import { Provider } from '../repos/misc'
import { DELETE_USER } from '../users/queries'

import { Permissions } from './types'
import { EDIT_USER, IMPERSONATE_SERVICE_ACCOUNT } from './queries'

import { Confirm } from './Confirm'
import { EditServiceAccount } from './CreateServiceAccount'

import { MoreMenu } from './MoreMenu'
import { hasRbac } from './utils'

export function UserInfo({ user: { email, name, avatar }, hue = 'lighter', ...box }: any) {
  return (
    <Box
      {...box}
      direction="row"
      gap="small"
      align="center"
    >
      <AppIcon
        url={avatar}
        name={name}
        spacing={avatar ? 'none' : undefined}
        size="xsmall"
        hue={hue}
      />
      <Box>
        <Span fontWeight="bold">{name}</Span>
        <Span color="text-light">{email}</Span>
      </Box>
    </Box>
  )
}

function UserEdit({ user, update }: any) {
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

  const menuItems = {
    addAdmin: {
      label: isAdmin ? 'Remove admin role' : 'Add admin role',
      onSelect: () => mutation({ variables: { attributes: { roles: { admin: !isAdmin } } } }),
      props: {},
    },
    deleteUser: {
      label: 'Delete user',
      onSelect: () => setConfirm(true),
      props: {
        destructive: true,
      },
    },
  }

  return (
    <>
      <MoreMenu
        onSelectionChange={selectedKey => {
          menuItems[selectedKey]?.onSelect()
        }}
      >
        {Object.entries(menuItems).map(([key, { label, props = {} }]) => (
          <ListBoxItem
            key={key}
            textValue={label}
            label={label}
            {...props}
            color="blue"
          />
        ))}
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

export function User({ user, update }: any) {
  const { account, ...me } = useContext(CurrentUserContext)

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
        {user.roles?.admin && (
          <Chip
            size="medium"
            hue="lighter"
          >
            Admin
          </Chip>
        )}
        {account.rootUser.id === user.id && <Chip size="medium">Root</Chip>}
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

export function ServiceAccount({ user, update }: any) {
  const { account, ...me } = useContext(CurrentUserContext)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, {
    variables: { id: user.id },
    update: (_cache,
      {
        data: {
          impersonateServiceAccount: { jwt },
        },
      }) => {
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
            onClick={() => mutation()}
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
        <GraphQLToast
          marginBottom="medium"
          marginRight="xxxxlarge"
          error={error}
          header="Failed to impersonate"
        />
      )}
    </>
  )
}
