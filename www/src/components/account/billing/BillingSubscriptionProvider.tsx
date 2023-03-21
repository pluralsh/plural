import { ReactNode, useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import moment from 'moment'

import SubscriptionContext, { SubscriptionContextType } from '../../../contexts/SubscriptionContext'
import PlatformPlansContext from '../../../contexts/PlatformPlansContext'
import LoadingIndicator from '../../utils/LoadingIndicator'

import BillingError from './BillingError'
import { SUBSCRIPTION_QUERY } from './queries'

type BillingSubscriptionProviderPropsType = {
  children: ReactNode
}

function BillingSubscriptionProvider({ children }: BillingSubscriptionProviderPropsType) {
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(SUBSCRIPTION_QUERY, { fetchPolicy: 'network-only', pollInterval: 60_000 })
  const { proPlatformPlan, proYearlyPlatformPlan, enterprisePlatformPlan } = useContext(PlatformPlansContext)

  const subscriptionContextValue = useMemo<SubscriptionContextType>(() => {
    const account = data?.account
    const availableFeatures = account?.availableFeatures
    const billingAddress = account?.billingAddress
    const billingCustomerId = account?.billingCustomerId
    const subscription = account?.subscription
    const isProPlan = !!subscription?.plan?.id && (subscription.plan.id === proPlatformPlan?.id || subscription.plan.id === proYearlyPlatformPlan?.id)
    const isEnterprisePlan = !!subscription?.plan?.id && subscription.plan.id === enterprisePlatformPlan?.id
    const isPaidPlan = isProPlan || isEnterprisePlan
    const isGrandfathered = moment().isBefore(moment(data?.account?.grandfatheredUntil))

    return {
      subscription,
      billingAddress,
      billingCustomerId,
      isProPlan,
      isEnterprisePlan,
      isPaidPlan,
      isGrandfathered,
      account,
      availableFeatures,
      refetch,
    }
  }, [data, refetch, proPlatformPlan, proYearlyPlatformPlan, enterprisePlatformPlan])

  if (error) return <BillingError />
  if (!data && loading) return <LoadingIndicator />

  return (
    <SubscriptionContext.Provider value={subscriptionContextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export default BillingSubscriptionProvider
