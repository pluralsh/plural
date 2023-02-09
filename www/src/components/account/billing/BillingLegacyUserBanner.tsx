import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '@pluralsh/design-system'
import { A, DivProps } from 'honorable'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

type BillingLegacyUserBannerPropsType = DivProps & {
  feature?: string
}

function BillingLegacyUserBanner({ feature, ...props }: BillingLegacyUserBannerPropsType) {
  const { account } = useContext(SubscriptionContext)

  if (account?.availableFeatures?.userManagement) return null

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
