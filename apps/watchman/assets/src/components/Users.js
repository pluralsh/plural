import React, { useContext, useEffect, useState } from 'react'
import { Box, Text, FormField, TextInput } from 'grommet'
import { useQuery, useMutation } from 'react-apollo'
import { USERS_Q, INVITE_USER } from './graphql/users'
import Scroller from './utils/Scroller'
import { Avatar } from './EditUser'
import { BreadcrumbsContext } from './Breadcrumbs'
import Button from './utils/Button'
import Modal, { ModalHeader } from './utils/Modal'
import Copyable from './utils/Copyable'

function User({user}) {
  return (
    <Box direction='row' pad='small' border='bottom' gap='small' align='center'>
      <Avatar me={user} size='50px' />
      <Box>
        <Text size='small' style={{fontWeight: 500}}>{user.name}</Text>
        <Text size='small'>{user.email}</Text>
      </Box>
    </Box>
  )
}

function InviteBanner({invite: {secureId}}) {
  return (
    <Box pad='small' direction='row' gap='small'>
      <Text size='small'>Invite link:</Text>
      <Copyable text={`https://${window.location.hostname}/invite/${secureId}`} pillText='Copied invite url' />
    </Box>
  )
}

function Invite() {
  const [email, setEmail] = useState('')
  const [mutation, {loading, data}] = useMutation(INVITE_USER, {variables: {email}})
  return (
    <Box width='100px'>
      <Modal target={<Button label='Invite user' />}>
      {setOpen => (
        <Box width='40vw'>
          <ModalHeader text='Invite user' setOpen={setOpen} />
          <Box pad='small'>
            {data && data.createInvite && (
              <InviteBanner invite={data.createInvite} />
            )}
            <FormField label='email'>
              <TextInput
                placeholder='someone@example.com'
                value={email} onChange={({target: {value}}) => setEmail(value)} />
            </FormField>
            <Box direction='row' justify='end'>
              <Button label='Invite' loading={loading} onClick={mutation} />
            </Box>
          </Box>
        </Box>
      )}
      </Modal>
    </Box>
  )
}

export default function Users() {
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  const {data, fetchMore} = useQuery(USERS_Q)
  useEffect(() => setBreadcrumbs([{text: 'users', url: '/users'}]), [])

  if (!data) return null
  const {edges, pageInfo} = data.users
  return (
    <Box height='calc(100vh - 45px)'>
      <Box direction='row' height='60px' pad='small' justify='end' border='bottom'>
        <Box fill='horizontal' justify='center' pad='small'>
          <Text size='small' weight='bold'>User Directory</Text>
        </Box>
        <Invite />
      </Box>
      <Box height='calc(100vh - 105px)'>
        <Scroller
          edges={edges}
          mapper={({node}) => <User user={node} />}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {users: {edges, pageInfo}}}) => {
              return {...prev, users: {
                ...prev.users, pageInfo, edges: [...prev.users.edges, ...edges]
              }}
            }
          })} />
      </Box>
    </Box>
  )
}