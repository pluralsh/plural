import { createContext } from 'react'

import {
  Account,
  AddressAttributes,
  PlanFeatures,
  PlatformSubscription,
} from '../generated/graphql'

export type SubscriptionContextType = {
  pricingFeaturesEnabled: boolean
  billingCustomerId: string | null
  subscription: PlatformSubscription | null
  account: Account | null
  billingAddress: AddressAttributes | null
  isPaidPlan: boolean
  isProPlan: boolean
  isEnterprisePlan: boolean
  isGrandfathered: boolean
  availableFeatures: PlanFeatures
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  pricingFeaturesEnabled: false,
  billingCustomerId: null,
  subscription: null,
  account: null,
  billingAddress: null,
  isPaidPlan: false,
  isProPlan: false,
  isEnterprisePlan: false,
  isGrandfathered: false,
  refetch: () => {},
})

export default SubscriptionContext
