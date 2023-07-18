import { Button } from '@pluralsh/design-system'
import { ReactElement, useCallback, useContext, useState } from 'react'

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

function InviteUserButton(): ReactElement {
  const { account } = useCurrentUser()
  const { isPaidPlan, isTrialPlan } = useContext(SubscriptionContext)
  const [action, setAction] = useState(Action.None)

  const openModal = useCallback(
    () =>
      (account?.userCount ?? 0) < MAX_OPEN_SOURCE_USERS ||
      isPaidPlan ||
      isTrialPlan
        ? setAction(Action.InviteUser)
        : setAction(Action.UserLimit),
    [account?.userCount, isPaidPlan, isTrialPlan]
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
        <InviteUserModal onClose={() => setAction(Action.None)} />
      )}
      {action === Action.UserLimit && (
        <UserLimitModal onClose={() => setAction(Action.None)} />
      )}
    </>
  )
}

export default InviteUserButton
