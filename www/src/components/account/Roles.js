import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { isEmpty } from 'lodash'
import { EmptyState, Input, SearchIcon } from 'pluralsh-design-system'
import { useContext, useState } from 'react'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { Placeholder } from '../accounts/Audits'
import { canEdit } from '../accounts/EditAccount'
import { DELETE_ROLE, ROLES_Q } from '../accounts/queries'
import { Permissions } from '../accounts/types'
import { CurrentUserContext } from '../login/CurrentUser'
import { DeleteIcon } from '../profile/Icon'
import { ListItem } from '../profile/ListItem'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { Container } from '../utils/Container'
import { StandardScroller } from '../utils/SmoothScroller'

import { Confirm } from './Confirm'

import { Info } from './Info'
import { CreateRole, UpdateRole } from './Role'
import { hasRbac } from './utils'

function Header({ q, setQ }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="medium"
    >
      <Box
        fill="horizontal"
        direction="row"
        align="center"
      >
        <Input
          width="50%"
          value={q}
          placeholder="Search for roles by name"
          startIcon={<SearchIcon size={15} />}
          onChange={({ target: { value } }) => setQ(value)}
        />
      </Box>
      <Box
        flex={false}
        direction="row"
        align="center"
      >
        <CreateRole q={q} />
      </Box>
    </Box>
  )
}

function Role({ role, q }) {
  const [confirm, setConfirm] = useState(false)
  const { account, ...me } = useContext(CurrentUserContext)
  const editable = canEdit(me, account) || hasRbac(me, Permissions.USERS)
  const [mutation, { loading, error }] = useMutation(DELETE_ROLE, {
    variables: { id: role.id },
    update: (cache, { data }) => updateCache(cache, {
      query: ROLES_Q,
      variables: { q },
      update: prev => removeConnection(prev, data.deleteRole, 'roles'),
    }),
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
            <UpdateRole
              role={role}
              q={q}
            />
          )}
          <DeleteIcon onClick={() => setConfirm(true)} />
        </Box>
        <Confirm
          open={confirm}
          text="Deleting roles cannot be undone."
          close={() => setConfirm(false)}
          submit={mutation}
          loading={loading}
          destructive
          error={error}
        />
      </>
    </Box>
  )
}

function RolesInner({ q }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(ROLES_Q, { variables: { q }, fetchPolicy: 'cache-and-network' })

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
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { roles } }) => extendConnection(prev, roles, 'roles'),
          })}
          hasNextPage={pageInfo.hasNextPage}
          loading={loading}
          placeholder={Placeholder}
        />
      ) : (
        <EmptyState message={isEmpty(q) ? "Looks like you don't have any roles yet." : `No roles found for ${q}`}>
          <CreateRole q={q} />
        </EmptyState>
      )}
    </Box>
  )
}

export function Roles() {
  const [q, setQ] = useState('')

  return (
    <Container type="table">
      <Box
        fill
        gap="medium"
      >
        <Header
          q={q}
          setQ={setQ}
        />
        <RolesInner q={q} />
      </Box>
    </Container>
  )
}
