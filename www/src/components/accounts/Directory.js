import React, { useState } from 'react'
import { Box, Text, TextInput } from 'grommet'
import { useQuery } from 'react-apollo'
import { Search } from 'grommet-icons'
import { GROUPS_Q, USERS_Q } from './queries'
import { Scroller, Loading } from 'forge-core'
import GroupRow from './Group'
import { UserRow } from './User'

export function Users() {
  const [q, setQ] = useState(null)
  const {data, fetchMore} = useQuery(USERS_Q, {variables: {q}})

  if (!data) return <Loading />

  const {users: {pageInfo, edges}} = data

  return (
    <Box pad='small' gap='small'>
      <Box direction='row' pad='small' align='center'>
        <Box fill='horizontal'>
          <Text weight={500}>Users</Text>
        </Box>
        <TextInput
          icon={<Search />}
          placeholder='search for users'
          value={q || ''}
          onChange={({target: {value}}) => setQ(value)} />
      </Box>
      <Scroller
        id='users'
        style={{height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}, next) => <UserRow key={node.id} user={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({variables: {userCursor: pageInfo.endCursor}})}
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
      <Box direction='row' pad='small' align='center'>
        <Box fill='horizontal'>
          <Text weight={500}>Groups</Text>
        </Box>
        <TextInput
          icon={<Search />}
          placeholder='search for groups'
          value={q || ''}
          onChange={({target: {value}}) => setQ(value)} />
      </Box>
      <Scroller
        id='groups'
        style={{height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}, next) => <GroupRow key={node.id} group={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({variables: {userCursor: pageInfo.endCursor}})}
      />
    </Box>
  )
}