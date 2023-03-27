import { ReactNode, useMemo } from 'react'
import moment from 'moment'
import { ApolloError } from '@apollo/client'

import SubscriptionContext, { SubscriptionContextType } from '../../../contexts/SubscriptionContext'

import BillingError from './BillingError'

type BillingSubscriptionProviderPropsType = {
  data?: any
  error?: ApolloError
  refetch: () => void
  children: ReactNode
}

function BillingSubscriptionProvider({
  data, error, refetch, children,
}: BillingSubscriptionProviderPropsType) {
  const subscriptionContextValue = useMemo<SubscriptionContextType>(() => {
    const account = data?.account
    const availableFeatures = account?.availableFeatures
    const billingAddress = account?.billingAddress
    const billingCustomerId = account?.billingCustomerId
    const subscription = account?.subscription
    const plan = subscription?.plan
    const isProPlan = plan?.name === 'Pro'
    const isEnterprisePlan = plan?.name === 'Enterprise'
    const isPaidPlan = isProPlan || isEnterprisePlan
    const grandfatheredUntil = account?.grandfatheredUntil
    const isLegacyUser = !!grandfatheredUntil
    const isGrandfathered = isLegacyUser && moment().isBefore(moment(grandfatheredUntil))

    // Marking grandfathering as expired only for a month after expiry date.
    // Afterwards expiry banners will not be visible and UI will be the same as for open-source users.
    const isGrandfathetingExpired = isLegacyUser
      && moment().isBetween(moment(grandfatheredUntil), moment(grandfatheredUntil).add(1, 'M'))

    return {
      subscription,
      billingAddress,
      billingCustomerId,
      isProPlan,
      isEnterprisePlan,
      isPaidPlan,
      isLegacyUser,
      isGrandfathered,
      isGrandfathetingExpired,
      account,
      availableFeatures,
      refetch,
    }
  }, [data, refetch])

  if (error) return <BillingError />

  return (
    <SubscriptionContext.Provider value={subscriptionContextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export default BillingSubscriptionProvider
