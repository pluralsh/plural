import {
  AppIcon,
  Button,
  Chip,
  Flex,
  GraphQLToast,
  ListBoxItem,
} from '@pluralsh/design-system'
import { useContext, useMemo, useState } from 'react'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import {
  Permission,
  useImpersonateServiceAccountMutation,
  useUpdateUserMutation,
} from '../../generated/graphql'
import {
  fetchRefreshToken,
  fetchToken,
  setAuthFromUser,
  setPreviousUserData,
} from '../../helpers/authentication'
import { canEdit } from '../../utils/account'
import UserSettingsModal from '../users/settings/UserSettingsModal'
import DeleteUserModal from '../utils/user/DeleteUserModal'
import { Body2P } from '../utils/Typography'

import { EditServiceAccount } from './CreateServiceAccount'
import { MoreMenu } from './MoreMenu'
import { hasRbac } from './utils'

export function UserInfo({
  user: { email, name, avatar },
  hue = 'lighter',
  fill,
  ...box
}: any) {
  return (
    <Flex
      {...(fill && { width: '100%' })}
      {...(fill === true && { height: '100%' })}
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
      <Flex
        direction="column"
        align="flex-start"
      >
        <span css={{ fontWeight: 'bold' }}>{name}</span>
        <Body2P
          as="span"
          $color="text-light"
        >
          {email}
        </Body2P>
      </Flex>
    </Flex>
  )
}

function UserEdit({ user, update, onSettingsClick }: any) {
  const [confirm, setConfirm] = useState(false)
  const [mutation] = useUpdateUserMutation()
  const isAdmin = !!user.roles?.admin

  const menuItems = {
    addAdmin: {
      label: isAdmin ? 'Remove admin role' : 'Add admin role',
      onSelect: () =>
        mutation({
          variables: {
            id: user.id,
            attributes: { roles: { admin: !isAdmin } },
          },
        }),
      props: {},
    },
    settings: {
      label: 'User settings',
      onSelect: onSettingsClick,
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
        onSelectionChange={(selectedKey) => {
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
      {confirm && (
        <DeleteUserModal
          user={user}
          update={update}
          onClose={() => setConfirm(false)}
        />
      )}
    </>
  )
}

export function User({ user, update }: any) {
  const me = useContext(CurrentUserContext)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const editable = useMemo(
    () => canEdit(me, me.account) || hasRbac(me, Permission.Users),
    [me]
  )

  return (
    <>
      <Flex
        width="100%"
        direction="row"
        align="center"
        cursor="pointer"
        onClick={() => setSettingsOpen(true)}
      >
        <UserInfo
          fill="horizontal"
          user={user}
        />
        <Flex
          flex="0 0 auto"
          direction="row"
          gap="large"
          align="center"
          onClick={(event) => event.stopPropagation()}
        >
          {user.roles?.admin && (
            <Chip
              size="medium"
              fillLevel={2}
            >
              Admin
            </Chip>
          )}
          {me.account.rootUser?.id === user.id && (
            <Chip size="medium">Root</Chip>
          )}
          {editable && (
            <UserEdit
              user={user}
              update={update}
              onSettingsClick={() => setSettingsOpen(true)}
            />
          )}
        </Flex>
      </Flex>
      {settingsOpen && (
        <UserSettingsModal
          user={user}
          update={update}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  )
}

export function ServiceAccount({ user, update }: any) {
  const me = useContext(CurrentUserContext)
  const editable = canEdit(me, me.account) || hasRbac(me, Permission.Users)
  const [mutation, { error }] = useImpersonateServiceAccountMutation({
    variables: { id: user.id },
    update: (_cache, { data }) => {
      setPreviousUserData({
        me,
        jwt: fetchToken(),
        refreshToken: fetchRefreshToken(),
      })
      setAuthFromUser(data?.impersonateServiceAccount)
      ;(window as Window).location = '/'
    },
  })

  return (
    <>
      <Flex
        width="100%"
        direction="row"
        align="center"
      >
        <UserInfo
          user={user}
          fill="horizontal"
        />
        <Flex
          flex="0 0 auto"
          direction="row"
          gap="large"
          align="center"
        >
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
        </Flex>
      </Flex>
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
