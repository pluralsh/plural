import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '@pluralsh/design-system'
import { A, DivProps } from 'honorable'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

type BillingLegacyUserBannerPropsType = DivProps & {
  feature?: string
}

function BillingLegacyUserBanner({ feature, ...props }: BillingLegacyUserBannerPropsType) {
  const { isProPlan, isEnterprisePlan, isGrandfathered } = useContext(SubscriptionContext)
  const open = !(isProPlan || isEnterprisePlan) && isGrandfathered

  if (!open) return null

  return (
    <Banner
      fullWidth
      severity="warning"
      heading="Legacy user access ends soon."
      {...props}
    >
      {!!feature && (
        <>
          {feature} are a Professional plan feature.
          {' '}
          <A
            inline
            as={Link}
            to="/account/billing"
          >
            Upgrade now
          </A>
          .
        </>
      )}
      {!feature && 'You have access to Professional features for a short period of time.'}
    </Banner>
  )
}

export default BillingLegacyUserBanner
