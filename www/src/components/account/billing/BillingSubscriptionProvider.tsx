import { ReactNode, useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import moment from 'moment'
import posthog from 'posthog-js'

import SubscriptionContext, { SubscriptionContextType } from '../../../contexts/SubscriptionContext'
import { PlatformSubscription } from '../../../generated/graphql'
import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'
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
  } = useQuery(SUBSCRIPTION_QUERY, { fetchPolicy: 'network-only' })
  const { proPlatformPlan, proYearlyPlatformPlan, enterprisePlatformPlan } = useContext(PlatformPlansContext)

  const pricingFeaturesEnabled = useMemo(() => posthog.isFeatureEnabled('pricing'), [])
  const subscription = useMemo(() => data?.account?.subscription as PlatformSubscription | null, [data])
  const billingAddress = useMemo(() => data?.account?.billingAddress ?? null, [data])
  const billingCustomerId = useMemo(() => data?.account?.billingCustomerId, [data])
  const isProPlan = useMemo(() => !!subscription?.plan?.id && (subscription.plan.id === proPlatformPlan?.id || subscription.plan.id === proYearlyPlatformPlan?.id), [subscription, proPlatformPlan, proYearlyPlatformPlan])
  const isEnterprisePlan = useMemo(() => !!subscription?.plan?.id && subscription.plan.id === enterprisePlatformPlan?.id, [subscription, enterprisePlatformPlan])
  const isPaidPlan = useMemo(() => isProPlan || isEnterprisePlan, [isProPlan, isEnterprisePlan])
  const isGrandfathered = useMemo(() => moment(data?.account?.grandfatheredUntil).diff(moment()) > 0, [data])
  const subscriptionContextValue = useMemo<SubscriptionContextType>(() => ({
    pricingFeaturesEnabled,
    subscription,
    billingAddress,
    billingCustomerId,
    isProPlan,
    isEnterprisePlan,
    isPaidPlan,
    isGrandfathered,
    refetch,
  }), [
    pricingFeaturesEnabled,
    subscription,
    billingAddress,
    billingCustomerId,
    isProPlan,
    isEnterprisePlan,
    isPaidPlan,
    isGrandfathered,
    refetch,
  ])

  if (error) return <BillingError />
  if (loading) return <BillingLoading />

  return (
    <SubscriptionContext.Provider value={subscriptionContextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export default BillingSubscriptionProvider
