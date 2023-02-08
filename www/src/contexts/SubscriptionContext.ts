import { createContext } from 'react'

import { AddressAttributes, PlatformSubscription } from '../generated/graphql'

export type SubscriptionContextType = {
  pricingFeaturesEnabled: boolean
  billingCustomerId: string | null
  subscription: PlatformSubscription | null
  billingAddress: AddressAttributes | null
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
  billingAddress: null,
  isPaidPlan: false,
  isProPlan: false,
  isEnterprisePlan: false,
  isGrandfathered: false,
  refetch: () => {},
})

export default SubscriptionContext
