import { useContext } from 'react'
import { Callout } from '@pluralsh/design-system'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { upperFirst } from 'lodash'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import usePersistedState from '../../../hooks/usePersistedState'

type BillingLegacyUserBannerPropsType = {
  feature?: string
}

const Wrapper = styled.div(({ theme }) => ({
  marginBottom: theme.spacing.large,
}))

export default function BillingLegacyUserBanner({
  feature,
}: BillingLegacyUserBannerPropsType) {
  const { isPaidPlan, isGrandfathered, isGrandfatheringExpired } =
    useContext(SubscriptionContext)
  const featureId = feature
    ? `${feature.replace(/\s+/g, '-').toLowerCase()}-`
    : ''
  const localStorageId = `${
    isGrandfatheringExpired ? 'expired-' : ''
  }legacy-banner-${featureId}closed`
  const [closed, setClosed] = usePersistedState(localStorageId, false)

  if (isPaidPlan || !(isGrandfathered || isGrandfatheringExpired)) return null

  return (
    <Wrapper>
      <Callout
        severity={isGrandfatheringExpired ? 'danger' : 'warning'}
        title={
          isGrandfatheringExpired
            ? 'Legacy user access expired.'
            : 'Legacy user access ends soon.'
        }
        closeable
        closed={closed}
        onClose={setClosed}
      >
        {isGrandfatheringExpired ? (
          <span>
            {feature ? (
              <>
                You may still use existing {feature} but creating new and
                editing existing {feature} requires a Plural Professional Plan.
              </>
            ) : (
              <>
                You may still use existing roles, groups, and service accounts
                but creating new and editing requires a Plural Professional
                Plan.
              </>
            )}
          </span>
        ) : (
          <span>
            {feature ? (
              <>{upperFirst(feature)} are a Professional plan feature.</>
            ) : (
              <>
                You have access to Professional features for a short period of
                time.
              </>
            )}
          </span>
        )}{' '}
        <Link to="/account/billing">Upgrade now.</Link>
      </Callout>
    </Wrapper>
  )
}
