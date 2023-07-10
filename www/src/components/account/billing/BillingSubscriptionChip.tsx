import { useContext } from 'react'

import { Chip } from '@pluralsh/design-system'

import { Link } from 'react-router-dom'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

function BillingSubscriptionChip() {
  const { isProPlan, isEnterprisePlan, isTrialPlan } =
    useContext(SubscriptionContext)

  return (
    <Link
      to="/account/billing"
      style={{ textDecoration: 'none' }}
    >
      <Chip
        severity={
          isTrialPlan || isEnterprisePlan || isProPlan ? 'info' : 'neutral'
        }
        fillLevel={2}
        height={32}
      >
        {isTrialPlan
          ? 'Free trial'
          : isEnterprisePlan
          ? 'Custom'
          : isProPlan
          ? 'Professional'
          : 'Open-source'}
      </Chip>
    </Link>
  )
}

export default BillingSubscriptionChip
