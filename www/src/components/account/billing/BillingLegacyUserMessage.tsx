import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { A, P } from 'honorable'

import moment from 'moment'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

function BillingLegacyUserMessage() {
  const {
    isProPlan, isEnterprisePlan, isGrandfathered, account,
  } = useContext(SubscriptionContext)

  const isLegacy = !(isProPlan || isEnterprisePlan) && account?.grandfatheredUntil
  const expired = !isGrandfathered

  if (!isLegacy) return null

  return (
    <P
      overline
      color="text-xlight"
    >
      Legacy user access {expired ? 'expired' : `until ${moment(account?.grandfatheredUntil).format('MMM DD, YYYY')}`}
      {' '}
      <A
        inline
        as={Link}
        to="/account/billing"
      >
        upgrade now
      </A>
    </P>
  )
}

export default BillingLegacyUserMessage
