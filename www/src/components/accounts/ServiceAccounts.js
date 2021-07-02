import React, { useState } from 'react'
import { Box, Layer, Text, TextInput } from 'grommet'
import { useMutation } from 'react-apollo'
import { Edit } from 'grommet-icons'
import { Scroller, Loading, ModalHeader, SecondaryButton } from 'forge-core'
import { IMPERSONATE_SERVICE_ACCOUNT, USERS_Q } from './queries'
import { CreateServiceAccount, UpdateServiceAccount } from './CreateServiceAccount'
import { UserRow } from './User'
import { extendConnection } from '../../utils/graphql'
import { useQuery } from 'react-apollo'
import { GqlError } from '../utils/Alert'
import { setToken } from '../../helpers/authentication'
import { SearchIcon } from './utils'

function ServiceAccount({user, next}) {
  const [open, setOpen] = useState(false)
  const [showError, setShowError] = useState(true)
  const [mutation, {loading, error}] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, {
    variables: {id: user.id},
    update: (cache, {data: {impersonateServiceAccount: {jwt}}}) => {
      setToken(jwt)
      window.location = '/'
    }
  })

  return (
    <>
    <Box fill='horizontal' gap='small' direction='row' align='center' border={{side: 'bottom', color: 'light-6'}}>
      <UserRow user={user} next={next.node} noborder />
      <SecondaryButton label='impersonate' onClick={mutation} loading={loading} />
      <Box flex={false} pad='small' round='xsmall' onClick={() => setOpen(true)}
           hoverIndicator='light-2' focusIndicator={false}>
        <Edit size='small' />
      </Box>
    </Box>
    {showError && error && (
      <Layer modal>
        <ModalHeader text='Impersonation error' setOpen={setShowError} />
        <Box width='40vw'>
          <GqlError error={error} header={`error attempting to impersonate ${user.name}`} />
        </Box>
      </Layer>
    )}
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
          icon={<SearchIcon />}
          reverse
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