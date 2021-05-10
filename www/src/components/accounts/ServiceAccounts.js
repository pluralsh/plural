import React, { useState } from 'react'
import { Box, Text, TextInput } from 'grommet'
import { Search } from 'grommet-icons'
import { Scroller, Loading } from 'forge-core'
import { USERS_Q } from './queries'
import { CreateServiceAccount } from './CreateServiceAccount'
import { UserRow } from './User'
import { extendConnection } from '../../utils/graphql'
import { useQuery } from 'react-apollo'

export function ServiceAccounts() {
  const [q, setQ] = useState(null)
  const {data, fetchMore} = useQuery(USERS_Q, {
    variables: {q, serviceAccount: true}, 
    fetchPolicy: 'cache-and-network'
  })

  if (!data) return <Loading />

  const {users: {pageInfo, edges}} = data

  return (
    <Box pad='small' gap='small'>
      <Box direction='row' pad='small' align='center' gap='small'>
        <Box fill='horizontal'>
          <Text weight={500}>Service Accounts</Text>
        </Box>
        <TextInput
          icon={<Search />}
          placeholder='search for service accounts'
          value={q || ''}
          onChange={({target: {value}}) => setQ(value)} />
        <Box flex={false}>
          <CreateServiceAccount />
        </Box>
      </Box>
      <Scroller
        id='service-accounts'
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