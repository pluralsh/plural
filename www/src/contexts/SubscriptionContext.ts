import { createContext } from 'react'

import { PlatformSubscription } from '../generated/graphql'

export type SubscriptionContextType = {
  subscription: PlatformSubscription | null
  isProPlan: boolean
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isProPlan: false,
  refetch: () => {},
})

export default SubscriptionContext
