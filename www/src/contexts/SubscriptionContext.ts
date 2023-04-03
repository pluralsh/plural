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
  isGrandfatheringExpired: boolean
  isDelinquent: boolean
  availableFeatures: SubscriptionAccountFragment['availableFeatures'] | null
  paymentMethods: PaymentMethodFragment[]
  defaultPaymentMethod: PaymentMethodFragment | null | undefined
  refetch: () => Promise<any>
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
  isGrandfatheringExpired: false,
  isDelinquent: false,
  availableFeatures: {},
  paymentMethods: [],
  defaultPaymentMethod: null,
  refetch: () => new Promise(resolve => {
    resolve({})
  }),
})

export default SubscriptionContext
