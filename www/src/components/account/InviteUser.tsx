import { Button, Div, Span } from 'honorable'
import {
  Codeline,
  MailIcon,
  Modal,
  ValidatedInput,
} from '@pluralsh/design-system'
import { useCallback, useState } from 'react'

import { useMutation } from '@apollo/client'

import { GqlError } from '../utils/Alert'

import { CREATE_INVITE } from './queries'

import { inviteLink } from './utils'

export function InviteUser() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState<any>(null)
  const [mutation, { loading, error, reset }] = useMutation(CREATE_INVITE, {
    variables: { attributes: { email } },
    onCompleted: data => {
      setInvite(data && data.createInvite)
    },
  })
  const resetAndClose = useCallback(() => {
    setEmail('')
    setInvite(null)
    setOpen(false)
    reset()
  }, [reset])

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
        header="Invite users"
        open={open}
        onClose={() => resetAndClose()}
        width="100%"
        actions={invite ? (
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
              onClick={() => mutation()}
              loading={loading}
              disabled={email.length === 0}
              marginLeft="medium"
            >
              Invite
            </Button>
          </>
        )}
      >
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
      </Modal>
    </>
  )
}
