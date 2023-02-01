import { useContext } from 'react'

import { Chip } from '@pluralsh/design-system'

import { Link } from 'react-router-dom'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

function BillingSubscriptionChip() {
  const { isProPlan } = useContext(SubscriptionContext)

  return (
    <Link
      to="/account/billing"
      style={{ textDecoration: 'none' }}
    >
      <Chip
        severity={isProPlan ? 'info' : 'neutral'}
        height={32}
      >
        {isProPlan ? 'Professional' : 'Open-source'}
      </Chip>
    </Link>
  )
}

export default BillingSubscriptionChip
