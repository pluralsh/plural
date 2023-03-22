import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react'

import { PaymentMethodFragment, usePaymentMethodsQuery } from '../../../generated/graphql'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

export type PaymentMethodsContextType = {
  paymentMethods: (PaymentMethodFragment | null | undefined)[]
  refetch: () => void
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | null>(null)

export function usePaymentMethods() {
  const context = useContext(PaymentMethodsContext)

  if (!context) {
    throw Error('usePaymentMethods() must be used inside a <PaymentMethodsProvider>')
  }

  return context
}

export function PaymentMethodsProvider({
  children,
}: PropsWithChildren) {
  const {
    data, loading, error, refetch,
  } = usePaymentMethodsQuery({
    fetchPolicy: 'network-only',
  })

  const paymentMethods = useMemo(() => data?.account?.paymentMethods?.edges?.map(edge => edge?.node),
    [data?.account?.paymentMethods?.edges])

  const contextVal = useMemo<PaymentMethodsContextType>(() => ({
    paymentMethods: paymentMethods || [],
    refetch,
  }),
  [paymentMethods, refetch])

  if (error) return <BillingError />
  if (loading) return <BillingLoading />

  return (
    <PaymentMethodsContext.Provider value={contextVal}>
      {children}
    </PaymentMethodsContext.Provider>
  )
}

export default PaymentMethodsProvider
