import { Button, Div, Span } from 'honorable'
import {
  Codeline,
  MailIcon,
  Modal,
  ModalActions,
  ModalHeader,
  ValidatedInput,
} from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

import { useMutation } from '@apollo/client'

import { inviteLink } from '../accounts/CreateInvite'
import { CREATE_INVITE } from '../accounts/queries'
import { GqlError } from '../utils/Alert'

export function InviteUser() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState(null)
  const resetAndClose = useCallback(() => {
    setEmail('')
    setInvite(null)
    setOpen(false)
  }, [])
  const [mutation, { loading, error }] = useMutation(CREATE_INVITE, {
    variables: { attributes: { email } },
    onCompleted: data => {
      setInvite(data && data.createInvite)
    },
  })

  return (
    <>
      <Div>
        <Button
          secondary
          onClick={() => setOpen(true)}
        >
          Invite user
        </Button>
      </Div>
      <Modal
        open={open}
        onClose={() => resetAndClose()}
        width="100%"
      >
        <ModalHeader>Invite users</ModalHeader>
        <ValidatedInput
          disabled={!!invite}
          value={email}
          startIcon={<MailIcon />}
          onChange={({ target: { value } }) => setEmail(value)}
          label="Email address"
        />
        {error && (
          <GqlError
            error={error}
            header="Failed to invite user"
          />
        )}
        {invite?.secureId && <Codeline marginTop="small">{inviteLink(invite)}</Codeline>}
        {invite && !invite.secureId && <Span>An email was sent to {email} to accept the invite</Span>}
        <ModalActions>
          {invite ? (
            <Button onClick={() => resetAndClose()}>Done</Button>
          ) : (
            <>
              <Button
                secondary
                onClick={() => resetAndClose()}
              >
                Cancel
              </Button>
              <Button
                onClick={mutation}
                loading={loading}
                disabled={email.length === 0}
                marginLeft="medium"
              >
                Invite
              </Button>
            </>
          )}
        </ModalActions>
      </Modal>
    </>
  )
}
