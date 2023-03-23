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
  paymentMethods: PaymentMethodFragment[]
  defaultPaymentMethod?: PaymentMethodFragment
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

export function PaymentMethodsProvider({ children }: PropsWithChildren) {
  const {
    data, loading, error, refetch,
  } = usePaymentMethodsQuery()

  const { paymentMethods, defaultPaymentMethod } = useMemo(() => {
    const result = (data?.account?.paymentMethods?.edges || [])?.reduce((prev, edge) => {
      const curNode = edge?.node

      return {
        defaultPaymentMethod: curNode?.isDefault
          ? curNode
          : prev.defaultPaymentMethod,
        paymentMethods: [
          ...prev.paymentMethods,
          ...(curNode ? [curNode] : []),
        ],
      }
    },
      { paymentMethods: [], defaultPaymentMethod: undefined } as {
        paymentMethods: PaymentMethodFragment[]
        defaultPaymentMethod: PaymentMethodFragment | undefined
      })

    return {
      paymentMethods: result.paymentMethods,
      defaultPaymentMethod: result.defaultPaymentMethod,
    }
  }, [data?.account?.paymentMethods?.edges])

  const contextVal = useMemo<PaymentMethodsContextType>(() => ({
    paymentMethods, // paymentMethods.sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0)),
    defaultPaymentMethod,
    refetch,
  }),
  [defaultPaymentMethod, paymentMethods, refetch])

  if (error) return <BillingError>{error.message}</BillingError>
  if (loading) return <BillingLoading />

  return (
    <PaymentMethodsContext.Provider value={contextVal}>
      {children}
    </PaymentMethodsContext.Provider>
  )
}

export default PaymentMethodsProvider
