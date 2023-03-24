import { ReactNode, useContext, useMemo } from 'react'
import moment from 'moment'

import SubscriptionContext, { SubscriptionContextType } from '../../../contexts/SubscriptionContext'
import { PaymentMethodFragment, SubscriptionAccountFragment, useSubscriptionQuery } from '../../../generated/graphql'
import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

type BillingSubscriptionProviderPropsType = {
  children: ReactNode
}

function useExtractPaymentMethods(methodsConnection:
    | SubscriptionAccountFragment['paymentMethods']
    | null
    | undefined) {
  const { paymentMethods, defaultPaymentMethod } = useMemo(() => {
    const result = (methodsConnection?.edges || [])?.reduce((prev, edge) => {
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
  }, [methodsConnection])

  return {
    paymentMethods,
    defaultPaymentMethod,
  }
}

function BillingSubscriptionProvider({
  children,
}: BillingSubscriptionProviderPropsType) {
  const {
    data, loading, error, refetch,
  } = useSubscriptionQuery({
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    pollInterval: 60_000,
  })
  const { proPlatformPlan, proYearlyPlatformPlan, enterprisePlatformPlan }
    = useContext(PlatformPlansContext)

  const subscription = useMemo(() => data?.account?.subscription ?? null,
    [data])
  const billingAddress = useMemo(() => data?.account?.billingAddress ?? null,
    [data])
  const billingCustomerId = useMemo(() => data?.account?.billingCustomerId,
    [data])
  const isProPlan = useMemo(() => !!subscription?.plan?.id
      && (subscription.plan.id === proPlatformPlan?.id
        || subscription.plan.id === proYearlyPlatformPlan?.id),
  [subscription, proPlatformPlan, proYearlyPlatformPlan])
  const isEnterprisePlan = useMemo(() => !!subscription?.plan?.id
      && subscription.plan.id === enterprisePlatformPlan?.id,
  [subscription, enterprisePlatformPlan])
  const isPaidPlan = useMemo(() => isProPlan || isEnterprisePlan,
    [isProPlan, isEnterprisePlan])
  const isGrandfathered = useMemo(() => moment().isBefore(moment(data?.account?.grandfatheredUntil)),
    [data])
  const { paymentMethods, defaultPaymentMethod } = useExtractPaymentMethods(data?.account?.paymentMethods)
  const subscriptionContextValue = useMemo<SubscriptionContextType>(() => ({
    subscription,
    billingAddress,
    billingCustomerId: billingCustomerId ?? null,
    isProPlan,
    isEnterprisePlan,
    isPaidPlan,
    isGrandfathered,
    account: data?.account ?? null,
    availableFeatures: data?.account?.availableFeatures,
    paymentMethods,
    defaultPaymentMethod,
    refetch,
  }),
  [
    subscription,
    billingAddress,
    billingCustomerId,
    isProPlan,
    isEnterprisePlan,
    isPaidPlan,
    isGrandfathered,
    data?.account,
    paymentMethods,
    defaultPaymentMethod,
    refetch,
  ])

  // Query could error if not allowed to fetch paymentMethods, but still return
  // the rest of the account data, so don't show error unless no data was received.
  if (error && !data) {
    return <BillingError>{`${error.name}: ${error.message}`}</BillingError>
  }
  if (loading) return <BillingLoading />

  return (
    <SubscriptionContext.Provider value={subscriptionContextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useBillingSubscription() {
  const ctx = useContext(SubscriptionContext)

  if (!ctx) {
    throw Error('useBillingSubscription() must be used inside of a <BillingSubscriptionProvider>')
  }

  return ctx
}

export default BillingSubscriptionProvider
