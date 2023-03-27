import { createContext } from 'react'

import {
  Account,
  AddressAttributes,
  PlanFeatures,
  PlatformSubscription,
} from '../generated/graphql'

export type SubscriptionContextType = {
  billingCustomerId?: string
  subscription?: PlatformSubscription
  account?: Account
  billingAddress?: AddressAttributes
  isPaidPlan: boolean
  isProPlan: boolean
  isEnterprisePlan: boolean
  isLegacyUser: boolean
  isGrandfathered: boolean
  isGrandfathetingExpired: boolean
  availableFeatures: PlanFeatures
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPaidPlan: false,
  isProPlan: false,
  isEnterprisePlan: false,
  isLegacyUser: false,
  isGrandfathered: false,
  isGrandfathetingExpired: false,
  availableFeatures: {},
  refetch: () => {},
})

export default SubscriptionContext
