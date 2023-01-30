import { ReactNode, useCallback, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { Flex, Spinner } from 'honorable'

import { PlatformPlan } from '../../../generated/graphql'

import PlatformPlansContext, { PlatformPlansContextType } from '../../../contexts/PlatformPlansContext'

import { PLATFORM_PLANS_QUERY } from './queries'

type BillingPlatformPlansProviderPropsType = {
  children: ReactNode
}

const errorPricing = {
  clusterMonthlyPricing: 0,
  userMonthlyPricing: 0,
}

function BillingPlatformPlansProvider({ children }: BillingPlatformPlansProviderPropsType) {
  const { data, loading, error } = useQuery(PLATFORM_PLANS_QUERY)

  const platformPlans = useMemo(() => data?.platformPlans as PlatformPlan[], [data])

  const { clusterMonthlyPricing, userMonthlyPricing } = useMemo(() => {
    if (!platformPlans?.length) return errorPricing

    const proPlan = platformPlans.find(p => p.name === 'Pro')

    if (!proPlan) return errorPricing

    const clusterMonthlyPricing = proPlan.lineItems?.find(x => x?.dimension === 'CLUSTER' && x?.period === 'MONTHLY')?.cost
    const userMonthlyPricing = proPlan.lineItems?.find(x => x?.dimension === 'USER' && x?.period === 'MONTHLY')?.cost

    return {
      clusterMonthlyPricing: clusterMonthlyPricing ? clusterMonthlyPricing / 100 : 0, // Stripe conventions are in cents
      userMonthlyPricing: userMonthlyPricing ? userMonthlyPricing / 100 : 0,
    }
  }, [platformPlans])

  const platformPlansContextValue = useMemo<PlatformPlansContextType>(() => ({
    platformPlans,
    clusterMonthlyPricing,
    userMonthlyPricing,
    annualDiscount: 0.2, // Hardcoded for now
  }), [
    platformPlans,
    clusterMonthlyPricing,
    userMonthlyPricing,
  ])

  const renderError = useCallback(() => (
    <Flex
      flexGrow={1}
      align="center"
      justify="center"
    >
      An error occured, please reload the page or contact support.
    </Flex>
  ), [])

  if (error) {
    return renderError()
  }

  if (loading) {
    return (
      <Flex
        flexGrow={1}
        align="center"
        justify="center"
      >
        <Spinner />
      </Flex>
    )
  }

  if (!platformPlans?.length) {
    return renderError()
  }

  return (
    <PlatformPlansContext.Provider value={platformPlansContextValue}>
      {children}
    </PlatformPlansContext.Provider>
  )
}

export default BillingPlatformPlansProvider
