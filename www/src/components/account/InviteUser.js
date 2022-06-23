import { Box } from 'grommet'
import { Button, Div } from 'honorable'
import { MailIcon, Modal, ModalActions, ValidatedInput } from 'pluralsh-design-system'
import { useState } from 'react'

import { Copyable } from 'forge-core'

import { useMutation } from '@apollo/client'

import { inviteLink } from '../accounts/CreateInvite'
import { CREATE_INVITE } from '../accounts/queries'

export function InviteUser() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [mutation, { loading, data }] = useMutation(CREATE_INVITE, {
    variables: { attributes: { email } },
  })

  const invite = data && data.createInvite

  return (
    <>
      <Div>
        <Button onClick={() => setOpen(true)}>Invite</Button>
      </Div>
      <Modal
        title="INVITE USERS"
        open={open}
        onClose={() => setOpen(false)}
      >
        {invite && (
          <Box
            pad="small"
          >
            <Copyable
              text={inviteLink(invite)}
              pillText="Invite link copied!"
            />
          </Box>
        )}
        <ValidatedInput
          value={email}
          startIcon={<MailIcon size={15} />}
          onChange={({ target: { value } }) => setEmail(value)}
          label="Email address"
        />
        <ModalActions>
          <Button
            secondary
            onClick={() => setOpen(false)}
          >Cancel
          </Button>
          <Button
            onClick={mutation}
            loading={loading}
            disabled={email.length === 0}
            marginLeft="medium"
          >Invite
          </Button>
        </ModalActions>
      </Modal>
    </>
  )
}
