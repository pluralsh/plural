import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { A, P } from 'honorable'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

function BillingLegacyUserMessage() {
  const { isProPlan, isEnterprisePlan, isGrandfathered } = useContext(SubscriptionContext)

  const open = !(isProPlan || isEnterprisePlan) && isGrandfathered
  const expired = !isGrandfathered

  if (!open) return null

  return (
    <P
      overline
      color="text-xlight"
    >
      Legacy user access {expired ? 'expired' : 'until May 1, 2023'}
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
