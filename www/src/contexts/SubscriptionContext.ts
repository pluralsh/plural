import { createContext } from 'react'

import { Address, PaymentMethodFragment, SubscriptionAccountFragment } from '../generated/graphql'

export type SubscriptionContextType = {
  billingCustomerId: string | null
  subscription: SubscriptionAccountFragment['subscription']
  account: SubscriptionAccountFragment | null
  billingAddress: Address | null
  isPaidPlan: boolean
  isProPlan: boolean
  isEnterprisePlan: boolean
  isLegacyUser: boolean
  isGrandfathered: boolean
  isGrandfathetingExpired: boolean
  availableFeatures: SubscriptionAccountFragment['availableFeatures'] | null
  paymentMethods: PaymentMethodFragment[]
  defaultPaymentMethod: PaymentMethodFragment | null | undefined
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  billingCustomerId: null,
  subscription: null,
  account: null,
  billingAddress: null,
  isPaidPlan: false,
  isProPlan: false,
  isEnterprisePlan: false,
  isLegacyUser: false,
  isGrandfathered: false,
  isGrandfathetingExpired: false,
  availableFeatures: {},
  paymentMethods: [],
  defaultPaymentMethod: null,
  refetch: () => {},
})

export default SubscriptionContext
