import { createContext } from 'react'

import { PlatformSubscription } from '../generated/graphql'

export type SubscriptionContextType = {
  subscription: PlatformSubscription | null
  isProPlan: boolean
  isEnterprisePlan: boolean
  isGrandfathered: boolean
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isProPlan: false,
  isEnterprisePlan: false,
  isGrandfathered: false,
  refetch: () => {},
})

export default SubscriptionContext
