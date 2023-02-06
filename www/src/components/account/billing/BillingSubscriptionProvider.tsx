import { ReactNode, useContext, useMemo } from 'react'

import SubscriptionContext, { SubscriptionContextType } from '../../../contexts/SubscriptionContext'

import CurrentUserContext from '../../../contexts/CurrentUserContext'
import { PlatformSubscription } from '../../../generated/graphql'
import PlatformPlansContext from '../../../contexts/PlatformPlansContext'
import { useQuery } from '@apollo/client'
import { SUBSCRIPTION_QUERY } from './queries'
import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

type BillingSubscriptionProviderPropsType = {
  children: ReactNode
}

function BillingSubscriptionProvider({ children }: BillingSubscriptionProviderPropsType) {
  const { data, loading, error, refetch } = useQuery(SUBSCRIPTION_QUERY, { fetchPolicy: 'network-only' })
  const { proPlatformPlan } = useContext(PlatformPlansContext)

  const subscription = useMemo(() => data?.account?.subscription as PlatformSubscription | null, [data])
  const isProPlan = useMemo(() => subscription?.plan?.id === proPlatformPlan.id, [subscription, proPlatformPlan])
  const subscriptionContextValue = useMemo<SubscriptionContextType>(() => ({
    subscription,
    isProPlan,
    refetch,
  }), [
    subscription,
    isProPlan,
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
