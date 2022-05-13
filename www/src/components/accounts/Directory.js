import { useCallback, useState } from 'react'
import { Box, TextInput } from 'grommet'
import { useQuery } from '@apollo/client'

import { Scroller } from 'forge-core'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { SectionContentContainer, SectionPortal } from '../Explore'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { GROUPS_Q, ROLES_Q, USERS_Q } from './queries'
import GroupRow from './Group'
import { UserRow } from './User'
import CreateGroup from './CreateGroup'
import CreateInvite from './CreateInvite'
import RoleRow, { RoleCreator } from './Role'

import { SearchIcon } from './utils'

import { INPUT_WIDTH } from './constants'

export function Users() {
  const [q, setQ] = useState(null)
  const { data, fetchMore } = useQuery(USERS_Q, { variables: { q }, fetchPolicy: 'cache-and-network' })
  const update = useCallback((cache, { data: { deleteUser } }) => updateCache(cache, {
    query: USERS_Q,
    variables: { q },
    update: prev => removeConnection(prev, deleteUser, 'users'),
  }), [q])

  if (!data) return <LoopingLogo scale="0.75" />

  const { users: { pageInfo, edges } } = data

  return (
    <SectionContentContainer header="Users">
      <Scroller
        id="users"
        style={{ height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }, next) => (
          <UserRow
            key={node.id}
            user={node}
            next={next.node}
            deletable
            update={update}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { users } }) => extendConnection(prev, users, 'users'),
        })}
      />
      <SectionPortal>
        <Box
          flex={false}
          gap="small"
          align="center"
          direction="row"
          width={INPUT_WIDTH}
        >
          <TextInput
            icon={<SearchIcon />}
            reverse
            placeholder="search for users"
            value={q || ''}
            onChange={({ target: { value } }) => setQ(value)}
          />
          <Box flex={false}>
            <CreateInvite />
          </Box>
        </Box>
      </SectionPortal>
    </SectionContentContainer>
  )
}

export function Groups() {
  const [q, setQ] = useState(null)
  const { data, fetchMore } = useQuery(GROUPS_Q, { variables: { q } })

  if (!data) return <LoopingLogo scale="0.75" />

  const { groups: { pageInfo, edges } } = data

  return (
    <SectionContentContainer header="Groups">
      <Scroller
        id="groups"
        style={{ height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }, next) => (
          <GroupRow
            key={node.id}
            group={node}
            next={next.node}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { groups } }) => extendConnection(prev, groups, 'groups'),
        })}
      />
      <SectionPortal>
        <Box
          flex={false}
          direction="row"
          align="center"
          gap="small"
          width={INPUT_WIDTH}
        >
          <TextInput
            icon={<SearchIcon />}
            reverse
            placeholder="search for groups"
            value={q || ''}
            onChange={({ target: { value } }) => setQ(value)}
          />
          <Box flex={false}>
            <CreateGroup />
          </Box>
        </Box>
      </SectionPortal>
    </SectionContentContainer>
  )
}

export function Roles() {
  const [q, setQ] = useState(null)
  const { data, fetchMore } = useQuery(ROLES_Q, { variables: { q } })

  if (!data) return <LoopingLogo scale="0.75" />

  const { roles: { pageInfo, edges } } = data

  return (
    <SectionContentContainer header="Roles">
      <Scroller
        id="roles"
        style={{ height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }, next) => (
          <RoleRow
            key={node.id}
            role={node}
            next={next.node}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { roles } }) => extendConnection(prev, roles, 'roles'),
        })}
      />
      <SectionPortal>
        <Box
          flex={false}
          direction="row"
          align="center"
          gap="small"
          width={INPUT_WIDTH}
        >
          <TextInput
            icon={<SearchIcon />}
            reverse
            placeholder="search for roles"
            value={q || ''}
            onChange={({ target: { value } }) => setQ(value)}
          />
          <RoleCreator />
        </Box>
      </SectionPortal>
    </SectionContentContainer>
  )
}
