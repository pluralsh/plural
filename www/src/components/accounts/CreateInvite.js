import { useState } from 'react'
import { Button, Copyable, GqlError, InputCollection } from 'forge-core'
import { Box, Layer } from 'grommet'
import { useMutation } from '@apollo/client'

import { apiHost } from '../../helpers/hostname'

import ResponsiveInput from '../ResponsiveInput'
import { ModalHeader } from '../ModalHeader'

import { CREATE_INVITE } from './queries'

export const inviteLink = invite => `https://${apiHost()}/invite/${invite.secureId}`

export function InviteForm() {
  const [email, setEmail] = useState('')
  const [mutation, { loading, data, error }] = useMutation(CREATE_INVITE, {
    variables: { attributes: { email } },
  })

  const invite = data && data.createInvite

  return (
    <Box gap="small">
      {invite && (
        <Box
          background="light-3"
          pad="small"
          round="small"
        >
          <Copyable
            text={inviteLink(invite)}
            pillText="Invite link copied!"
          />
        </Box>
      )}
      {error && (
        <GqlError
          error={error}
          header="Could not create invite"
        />
      )}
      <InputCollection>
        <ResponsiveInput
          label="email"
          value={email}
          placeholder="email of person to invite"
          onChange={({ target: { value } }) => setEmail(value)}
        />
      </InputCollection>
      {/* <Box gap='xsmall'>
        <Text size='small' weight='bold'>assign to groups (optional)</Text>
        <GroupTypeahead groups={groups} setGroups={setGroups} />
      </Box> */}
      <Box
        direction="row"
        justify="end"
      >
        <Button
          label="Invite"
          onClick={mutation}
          loading={loading}
        />
      </Box>
    </Box>
  )
}

export default function CreateInvite() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        label="Invite"
        onClick={() => setOpen(true)}
      />
      {open && (
        <Layer
          modal
          position="center"
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
        >
          <Box width="35vw">
            <ModalHeader
              text="Invite a user"
              setOpen={setOpen}
            />
            <Box pad="small">
              <InviteForm />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}
