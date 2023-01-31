import { ReactNode, useContext, useMemo } from 'react'

import SubscriptionContext, { SubscriptionContextType } from '../../../contexts/SubscriptionContext'

import CurrentUserContext from '../../../contexts/CurrentUserContext'
import { PlatformSubscription } from '../../../generated/graphql'
import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

type BillingSubscriptionProviderPropsType = {
  children: ReactNode
}

function BillingSubscriptionProvider({ children }: BillingSubscriptionProviderPropsType) {
  const { me, refetch } = useContext(CurrentUserContext)
  const { proPlatformPlan } = useContext(PlatformPlansContext)

  const subscription = useMemo(() => me?.account?.subscription as PlatformSubscription | null, [me])
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

  console.log('subscriptionContextValue', subscriptionContextValue)

  return (
    <SubscriptionContext.Provider value={subscriptionContextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export default BillingSubscriptionProvider
