import React, { useState } from 'react'
import { Button, ModalHeader, InputCollection, ResponsiveInput, Copyable } from 'forge-core'
import { Layer, Box } from 'grommet'
import { useMutation } from 'react-apollo'
import { CREATE_INVITE } from './queries'
import { apiHost } from '../../helpers/hostname'

export function InviteForm() {
  const [email, setEmail] = useState('')
  const [mutation, {loading, data}] = useMutation(CREATE_INVITE, {
    variables: {attributes: {email}}
  })

  const invite = data && data.createInvite
  return (
    <Box gap='small'>
      {invite && (
        <Box background='light-3' pad='small' round='small'>
          <Copyable text={`https://${apiHost()}/invite/${invite.secureId}`} pillText='Invite link copied!' />
        </Box>
      )}
      <InputCollection>
        <ResponsiveInput
          label='email'
          value={email}
          placeholder='email of person to invite'
          onChange={({target: {value}}) => setEmail(value)} />
      </InputCollection>
      {/* <Box gap='xsmall'>
        <Text size='small' weight='bold'>assign to groups (optional)</Text>
        <GroupTypeahead groups={groups} setGroups={setGroups} />
      </Box> */}
      <Box direction='row' justify='end'>
        <Button label='Invite' onClick={mutation} loading={loading} />
      </Box>
    </Box>
  )
}

export default function CreateInvite() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button label='Invite' onClick={() => setOpen(true)} />
      {open && (
        <Layer modal position='center' onClickOutside={() => setOpen(false)} onEsc={() => setOpen(false)}>
          <Box width='35vw'>
            <ModalHeader text='Create a new group' setOpen={setOpen} />
            <Box pad='small'>
              <InviteForm />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}