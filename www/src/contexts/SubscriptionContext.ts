import { createContext } from 'react'

import { PlatformSubscription } from '../generated/graphql'

export type SubscriptionContextType = {
  subscription: PlatformSubscription | null
  isProPlan: boolean
  isGrandfathered: boolean
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isProPlan: false,
  isGrandfathered: false,
  refetch: () => {},
})

export default SubscriptionContext
