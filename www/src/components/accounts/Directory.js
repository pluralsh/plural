import React, { useState } from 'react'
import { Box, Text, TextInput } from 'grommet'
import { useQuery } from 'react-apollo'
import { GROUPS_Q, ROLES_Q, USERS_Q } from './queries'
import { Scroller, Loading } from 'forge-core'
import GroupRow from './Group'
import { UserRow } from './User'
import CreateGroup from './CreateGroup'
import CreateInvite from './CreateInvite'
import RoleRow, { RoleCreator } from './Role'
import { extendConnection } from '../../utils/graphql'
import { SearchIcon } from './utils'

export function Users() {
  const [q, setQ] = useState(null)
  const {data, fetchMore} = useQuery(USERS_Q, {variables: {q}})

  if (!data) return <Loading />

  const {users: {pageInfo, edges}} = data

  return (
    <Box pad='small' gap='small'>
      <Box direction='row' pad='small' align='center' gap='small'>
        <Box fill='horizontal'>
          <Text weight={500}>Users</Text>
        </Box>
        <TextInput
          icon={<SearchIcon />}
          placeholder='search for users'
          value={q || ''}
          onChange={({target: {value}}) => setQ(value)} />
        <Box flex={false}>
          <CreateInvite />
        </Box>
      </Box>
      <Scroller
        id='users'
        style={{height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}, next) => <UserRow key={node.id} user={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {userCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {users}}) => extendConnection(prev, users, 'users')
        })}
      />
    </Box>
  )
}

export function Groups() {
  const [q, setQ] = useState(null)
  const {data, fetchMore} = useQuery(GROUPS_Q, {variables: {q}})

  if (!data) return <Loading />

  const {groups: {pageInfo, edges}} = data

  return (
    <Box pad='small' gap='small'>
      <Box direction='row' pad='small' align='center' gap='small'>
        <Box fill='horizontal'>
          <Text weight={500}>Groups</Text>
        </Box>
        <TextInput
          icon={<SearchIcon />}
          placeholder='search for groups'
          value={q || ''}
          onChange={({target: {value}}) => setQ(value)} />
        <Box flex={false}>
          <CreateGroup />
        </Box>
      </Box>
      <Scroller
        id='groups'
        style={{height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}, next) => <GroupRow key={node.id} group={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {userCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {groups}}) => extendConnection(prev, groups, 'groups')
        })}
      />
    </Box>
  )
}

export function Roles() {
  const [q, setQ] = useState(null)
  const {data, fetchMore} = useQuery(ROLES_Q)

  if (!data) return <Loading />

  const {roles: {pageInfo, edges}} = data

  return (
    <Box pad='small' gap='small'>
      <Box direction='row' pad='small' align='center' gap='small'>
        <Box fill='horizontal'>
          <Text weight={500}>Roles</Text>
        </Box>
        <TextInput
          icon={<SearchIcon />}
          placeholder='search for roles'
          value={q || ''}
          onChange={({target: {value}}) => setQ(value)} />
        <RoleCreator />
      </Box>
      <Scroller
        id='roles'
        style={{height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}, next) => <RoleRow key={node.id} role={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {userCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {roles}}) => extendConnection(prev, roles, 'roles')
        })}
      />
    </Box>
  )
}