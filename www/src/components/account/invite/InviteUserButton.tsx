import { Button } from '@pluralsh/design-system'
import { ReactElement, useCallback, useContext, useState } from 'react'

import { toNumber } from 'lodash'

import { useCurrentUser } from '../../../contexts/CurrentUserContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'

import InviteUserModal from './InviteUserModal'
import UserLimitModal from './UserLimitModal'

const MAX_OPEN_SOURCE_USERS = 5

enum Action {
  None,
  InviteUser,
  UserLimit,
}

function InviteUserButton({ onInvite }): ReactElement {
  const { account } = useCurrentUser()
  const { isPaidPlan, isTrialPlan } = useContext(SubscriptionContext)
  const [action, setAction] = useState(Action.None)
  let userCount = toNumber(account.userCount)

  if (Number.isNaN(userCount)) {
    userCount = 0
  }

  const openModal = useCallback(
    () =>
      userCount < MAX_OPEN_SOURCE_USERS || isPaidPlan || isTrialPlan
        ? setAction(Action.InviteUser)
        : setAction(Action.UserLimit),
    [isPaidPlan, isTrialPlan, userCount]
  )

  return (
    <>
      <Button
        secondary
        onClick={openModal}
      >
        Invite user
      </Button>
      {action === Action.InviteUser && (
        <InviteUserModal
          onClose={() => setAction(Action.None)}
          onInvite={onInvite}
        />
      )}
      {action === Action.UserLimit && (
        <UserLimitModal onClose={() => setAction(Action.None)} />
      )}
    </>
  )
}

export default InviteUserButton
