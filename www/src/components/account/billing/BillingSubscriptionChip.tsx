import { useContext } from 'react'

import { Chip } from '@pluralsh/design-system'

import { Link } from 'react-router-dom'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

function BillingSubscriptionChip({
  size,
  asLink = true,
}: {
  size?: 'small'
  asLink?: boolean
}) {
  const { isProPlan, isEnterprisePlan, isTrialPlan } =
    useContext(SubscriptionContext)

  const chip = (
    <Chip
      severity={
        isTrialPlan || isEnterprisePlan || isProPlan ? 'info' : 'neutral'
      }
      fillLevel={2}
      {...(size === 'small' ? { size: 'small' } : { css: { height: 32 } })}
    >
      {isEnterprisePlan
        ? 'Enterprise'
        : isProPlan || isTrialPlan
          ? 'Pro'
          : 'Free'}
    </Chip>
  )

  return asLink ? (
    <Link
      to="/account/billing"
      style={{ textDecoration: 'none' }}
    >
      {chip}
    </Link>
  ) : (
    chip
  )
}

export default BillingSubscriptionChip
