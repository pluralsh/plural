import {
  AppIcon,
  Chip,
  GraphQLToast,
  ListBoxItem,
} from '@pluralsh/design-system'
import { Box } from 'grommet'
import { Button, Span } from 'honorable'
import { useContext, useMemo, useState } from 'react'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import {
  Permission,
  useImpersonateServiceAccountMutation,
  useUpdateUserMutation,
} from '../../generated/graphql'
import {
  fetchToken,
  setPreviousUserData,
  setToken,
} from '../../helpers/authentication'
import { canEdit } from '../../utils/account'
import UserSettingsModal from '../users/settings/UserSettingsModal'
import { ProviderIcon } from '../utils/ProviderIcon'
import DeleteUserModal from '../utils/user/DeleteUserModal'

import { EditServiceAccount } from './CreateServiceAccount'
import { MoreMenu } from './MoreMenu'
import { hasRbac } from './utils'

export function UserInfo({
  user: { email, name, avatar },
  hue = 'lighter',
  ...box
}: any) {
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
      <Box align="start">
        <Span fontWeight="bold">{name}</Span>
        <Span
          color="text-light"
          body2
        >
          {email}
        </Span>
      </Box>
    </Box>
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
      <Box
        fill="horizontal"
        direction="row"
        align="center"
        onClick={() => setSettingsOpen(true)}
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
          onClick={(event) => event.stopPropagation()}
        >
          {user.provider && (
            <ProviderIcon
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
        </Box>
      </Box>
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
      setPreviousUserData({ me, jwt: fetchToken() })
      setToken(data?.impersonateServiceAccount?.jwt)
      ;(window as Window).location = '/'
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
            <ProviderIcon
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
          // @ts-expect-error
          error={error}
          header="Failed to impersonate"
        />
      )}
    </>
  )
}
