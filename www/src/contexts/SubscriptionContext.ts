import { createContext } from 'react'

import { PlatformSubscription } from '../generated/graphql'

export type SubscriptionContextType = {
  pricingFeaturesEnabled: boolean
  billingCustomerId: string | null
  subscription: PlatformSubscription | null
  isPaidPlan: boolean
  isProPlan: boolean
  isEnterprisePlan: boolean
  isGrandfathered: boolean
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  pricingFeaturesEnabled: false,
  billingCustomerId: null,
  subscription: null,
  isPaidPlan: false,
  isProPlan: false,
  isEnterprisePlan: false,
  isGrandfathered: false,
  refetch: () => {},
})

export default SubscriptionContext
