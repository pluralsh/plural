import React, { useState } from 'react'
import { Box, Layer, Text, TextInput } from 'grommet'
import { Edit, Search } from 'grommet-icons'
import { Scroller, Loading, ModalHeader } from 'forge-core'
import { USERS_Q } from './queries'
import { CreateServiceAccount, UpdateServiceAccount } from './CreateServiceAccount'
import { UserRow } from './User'
import { extendConnection } from '../../utils/graphql'
import { useQuery } from 'react-apollo'

function ServiceAccount({user, next}) {
  const [open, setOpen] = useState(false)
  return (
    <>
    <Box fill='horizontal' gap='small' direction='row' align='center'>
      <UserRow user={user} next={next.node} />
      <Box flex={false} pad='small' round='xsmall' onClick={() => setOpen(true)}
           hoverIndicator='light-2' focusIndicator={false}>
        <Edit size='small' />
      </Box>
    </Box>
    {open && (
      <Layer modal>
        <ModalHeader text='Create a new service account' setOpen={setOpen} />
        <Box width='40vw'>
          <UpdateServiceAccount user={user} setOpen={setOpen} />
        </Box>
      </Layer>
    )}
    </>
  )
}

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
        mapper={({node}, next) => <ServiceAccount key={node.id} user={node} next={next} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {userCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {users}}) => extendConnection(prev, users, 'users')
        })}
      />
    </Box>
  )
}