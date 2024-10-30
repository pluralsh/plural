import {
  Codeline,
  MailIcon,
  Modal,
  ValidatedInput,
} from '@pluralsh/design-system'
import { Button, Div, P, Span } from 'honorable'
import { useCallback, useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import { toNumber } from 'lodash'

import { useCurrentUser } from '../../contexts/CurrentUserContext'
import SubscriptionContext from '../../contexts/SubscriptionContext'
import { GqlError } from '../utils/Alert'

import { inviteLink } from './utils'
import { useCreateInviteMutation } from '../../generated/graphql'

const MAX_OPEN_SOURCE_USERS = 5

export function InviteUser({ refetch }: { refetch?: (() => void) | null }) {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState<any>(null)
  const { account } = useCurrentUser()
  const { isGrandfathered, isPaidPlan } = useContext(SubscriptionContext)
  const [mutation, { loading, error, reset }] = useCreateInviteMutation({
    variables: { attributes: { email } },
    onCompleted: (data) => {
      setInvite(data?.createInvite)
      refetch?.()
    },
  })
  const resetAndClose = useCallback(() => {
    setEmail('')
    setInvite(null)
    setShowInviteModal(false)
    reset()
  }, [reset])

  const attemptInvite = useCallback(() => {
    let userCount = toNumber(account?.userCount)

    userCount = Number.isNaN(userCount) ? 0 : userCount
    if (!isGrandfathered && !isPaidPlan && userCount >= MAX_OPEN_SOURCE_USERS) {
      setShowLimitModal(true)
    } else {
      setShowInviteModal(true)
    }
  }, [account.userCount, isGrandfathered, isPaidPlan])

  return (
    <>
      <Div>
        <Button
          secondary
          onClick={attemptInvite}
        >
          Invite user
        </Button>
      </Div>
      <Modal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        size="medium"
        header="User limit"
        severity="danger"
        actions={
          <Button
            as={Link}
            to="/account/billing"
          >
            Review plans
          </Button>
        }
      >
        <P body1>
          You have reached your user limit for the Open-source plan. Upgrade to
          Plural Professional to add additional users.
        </P>
      </Modal>
      <Modal
        header="Invite users"
        open={showInviteModal}
        onClose={() => resetAndClose()}
        size="auto"
        actions={
          invite ? (
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
          )
        }
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
        {invite?.secureId && (
          <Codeline marginTop="small">{inviteLink(invite)}</Codeline>
        )}
        {invite && !invite.secureId && (
          <Span>An email was sent to {email} to accept the invite</Span>
        )}
      </Modal>
    </>
  )
}
