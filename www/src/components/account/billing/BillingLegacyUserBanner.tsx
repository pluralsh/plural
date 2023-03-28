import { useContext } from 'react'
import { Callout } from '@pluralsh/design-system'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

type BillingLegacyUserBannerPropsType = {
  feature?: string
}

const Wrapper = styled.div(({ theme }) => ({ marginBottom: theme.spacing.large }))

export default function BillingLegacyUserBanner({ feature }: BillingLegacyUserBannerPropsType) {
  const { isPaidPlan, isGrandfathered, isGrandfathetingExpired } = useContext(SubscriptionContext)

  if (isPaidPlan || !(isGrandfathered || isGrandfathetingExpired)) return null

  return (
    <Wrapper>
      <Callout
        severity={isGrandfathetingExpired ? 'danger' : 'warning'}
        title={isGrandfathetingExpired ? 'Legacy user access expired.' : 'Legacy user access ends soon.'}
      >
        {isGrandfathetingExpired
          ? (
            <span>
              {feature
                ? (
                  <>
                    You may still use existing {feature} but creating new
                    and editing existing {feature} requires a Plural Professional Plan.
                  </>
                )
                : (
                  <>
                    You may still use existing roles, groups, and service accounts but creating
                    new and editing requires a Plural Professional Plan.
                  </>
                )}
            </span>
          )
          : (
            <span>
              {feature
                ? (
                  <>
                    {feature.charAt(0).toUpperCase() + feature.slice(1)} are
                    a Professional plan feature.
                  </>
                )
                : <>You have access to Professional features for a short period of time.</>}
            </span>
          )}
        {' '}
        <Link to="/account/billing?upgrade=true">Upgrade now.</Link>
      </Callout>
    </Wrapper>
  )
}
