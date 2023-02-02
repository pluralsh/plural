import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import isEmpty from 'lodash/isEmpty'
import { Flex } from 'honorable'
import { EmptyState, PageTitle, SearchIcon } from '@pluralsh/design-system'
import { useContext, useState } from 'react'

import { Placeholder } from '../utils/Placeholder'

import CurrentUserContext from '../../contexts/CurrentUserContext'

import { List, ListItem } from '../utils/List'
import ListInput from '../utils/ListInput'
import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { canEdit } from '../users/EditAccount'

import { DeleteIconButton } from '../utils/IconButtons'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { Permissions } from './types'
import { DELETE_ROLE, ROLES_Q } from './queries'

import { hasRbac } from './utils'

import { Confirm } from './Confirm'

import { Info } from './Info'
import { EditRole } from './EditRole'
import { CreateRole } from './CreateRole'

import BillingLegacyUserBanner from './billing/BillingLegacyUserBanner'

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
  const { me: { account, ...me } } = useContext(CurrentUserContext)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)
  const [mutation, { loading, error }] = useMutation(DELETE_ROLE, {
    variables: { id: role.id },
    update: (cache, { data }) => updateCache(cache, {
      query: ROLES_Q,
      variables: { q },
      update: prev => removeConnection(prev, data.deleteRole, 'roles'),
    }),
    onCompleted: () => setConfirm(false),
  })

  return (
    <Box
      fill="horizontal"
      direction="row"
      align="center"
    >
      <Info
        text={role.name}
        description={role.description || 'no description'}
      />
      <>
        <Box
          flex={false}
          direction="row"
          gap="24px"
          align="center"
        >
          {editable && (
            <EditRole
              role={role}
              q={q}
            />
          )}
          <DeleteIconButton onClick={() => setConfirm(true)} />
        </Box>
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
    </Box>
  )
}

function RolesInner({ q }: any) {
  const [listRef, setListRef] = useState<any>(null)
  const { data, loading, fetchMore } = useQuery(ROLES_Q, {
    variables: { q },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return <LoopingLogo />

  const { edges, pageInfo } = data.roles

  return (
    <Box
      fill
      pad={{ bottom: 'small' }}
    >
      {edges?.length ? (
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          mapper={({ node: role }, { prev, next }) => (
            <ListItem
              first={!prev.node}
              last={!next.node}
            >
              <Role
                role={role}
                q={q}
              />
            </ListItem>
          )}
          loadNextPage={() => pageInfo.hasNextPage
            && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { roles } }) => extendConnection(prev, roles, 'roles'),
            })}
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
    </Box>
  )
}

export function Roles() {
  const [q, setQ] = useState('')

  return (
    <Flex
      flexGrow={1}
      flexDirection="column"
      maxHeight="100%"
    >
      <PageTitle heading="Roles">
        {' '}
        <CreateRole q={q} />
      </PageTitle>
      <BillingLegacyUserBanner
        feature="Roles"
        marginBottom="large"
      />
      <List>
        <Header
          q={q}
          setQ={setQ}
        />
        <RolesInner q={q} />
      </List>
    </Flex>
  )
}
