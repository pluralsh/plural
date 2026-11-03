import { useQuery } from '@apollo/client'
import isEmpty from 'lodash/isEmpty'
import { EmptyState, Flex, SearchIcon } from '@pluralsh/design-system'
import { useContext, useState } from 'react'

import { Placeholder } from '../utils/Placeholder'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { List, ListItem } from '../utils/List'
import ListInput from '../utils/ListInput'
import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'
import { DeleteIconButton } from '../utils/IconButtons'
import { StandardScroller } from '../utils/SmoothScroller'
import { Permission, useDeleteRoleMutation } from '../../generated/graphql'
import { canEdit } from '../../utils/account'
import LoadingIndicator from '../utils/LoadingIndicator'

import SubscriptionContext from '../../contexts/SubscriptionContext'

import { Confirm } from '../utils/Confirm'

import BillingTrialBanner from './billing/BillingTrialBanner'

import { ROLES_Q } from './queries'
import { hasRbac } from './utils'
import { Info } from './Info'
import { EditRole } from './EditRole'
import { CreateRole } from './CreateRole'
import BillingLegacyUserBanner from './billing/BillingLegacyUserBanner'
import { SAMPLE_GROUP_ROWS, UpgradeGate } from './UpgradeGate'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

function Header({ q, setQ }: any) {
  return (
    <ListInput
      width="100%"
      value={q}
      placeholder="Search a role"
      startIcon={<SearchIcon color="text-light" />}
      onChange={({ target: { value } }) => setQ(value)}
      flexGrow={0}
    />
  )
}

function Role({ role, q }: any) {
  const [confirm, setConfirm] = useState(false)
  const me = useContext(CurrentUserContext)
  const editable = canEdit(me, me.account) || hasRbac(me, Permission.Users)
  const [mutation, { loading, error }] = useDeleteRoleMutation({
    variables: { id: role.id },
    update: (cache, { data }) =>
      updateCache(cache, {
        query: ROLES_Q,
        variables: { q },
        update: (prev) => removeConnection(prev, data?.deleteRole, 'roles'),
      }),
    onCompleted: () => setConfirm(false),
  })

  return (
    <Flex
      width="100%"
      direction="row"
    >
      <Info
        text={role.name}
        description={role.description || 'no description'}
      />
      <>
        <Flex
          flex="0 0 auto"
          direction="row"
          gap="large"
          align="center"
        >
          {editable && (
            <EditRole
              role={role}
              q={q}
            />
          )}
          <DeleteIconButton onClick={() => setConfirm(true)} />
        </Flex>
        <Confirm
          open={confirm}
          text="Deleting roles cannot be undone."
          close={() => setConfirm(false)}
          submit={() => mutation()}
          loading={loading}
          destructive
          error={error}
        />
      </>
    </Flex>
  )
}

function RolesInner({ q }: any) {
  const [listRef, setListRef] = useState<any>(null)
  const { data, loading, fetchMore } = useQuery(ROLES_Q, {
    variables: { q },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return <LoadingIndicator />

  const { edges, pageInfo } = data.roles

  return (
    <Flex
      direction="column"
      width="100%"
      height="100%"
      paddingBottom="small"
    >
      {edges?.length ? (
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          mapper={({ node: role }, { prev, next }) => (
            <ListItem
              key={role.id}
              first={!prev.node}
              last={!next.node}
            >
              <Role
                role={role}
                q={q}
              />
            </ListItem>
          )}
          loadNextPage={() =>
            pageInfo.hasNextPage &&
            fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { roles } }) =>
                extendConnection(prev, roles, 'roles'),
            })
          }
          hasNextPage={pageInfo.hasNextPage}
          loading={loading}
          placeholder={Placeholder}
        />
      ) : (
        <EmptyState
          message={
            isEmpty(q)
              ? "Looks like you don't have any roles yet."
              : `No roles found for ${q}`
          }
        >
          <CreateRole q={q} />
        </EmptyState>
      )}
    </Flex>
  )
}

export function Roles() {
  const [q, setQ] = useState('')
  const { availableFeatures } = useContext(SubscriptionContext)
  const isAvailable = !!availableFeatures?.userManagement

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <SubpageHeader title="Roles">
        <CreateRole q={q} />
      </SubpageHeader>
      <BillingLegacyUserBanner feature="roles" />
      <BillingTrialBanner />
      {isAvailable ? (
        <List>
          <Header
            q={q}
            setQ={setQ}
          />
          <RolesInner q={q} />
        </List>
      ) : (
        <UpgradeGate
          feature="roles"
          description="Define granular permissions for your organization’s users and apply them to groups or individuals."
          searchPlaceholder="Search a role"
          rows={SAMPLE_GROUP_ROWS}
        />
      )}
    </Flex>
  )
}
