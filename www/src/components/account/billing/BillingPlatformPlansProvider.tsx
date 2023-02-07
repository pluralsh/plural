import { ReactNode, useMemo } from 'react'
import { useQuery } from '@apollo/client'

import { PlatformPlan } from '../../../generated/graphql'

import PlatformPlansContext, { PlatformPlansContextType } from '../../../contexts/PlatformPlansContext'

import { PLATFORM_PLANS_QUERY } from './queries'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

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
  const proPlatformPlan = useMemo(() => (platformPlans ? platformPlans.find(p => p.name === 'Pro' && p.period === 'MONTHLY')! : {} as PlatformPlan), [platformPlans])
  const proYearlyPlatformPlan = useMemo(() => (platformPlans ? platformPlans.find(p => p.name === 'Pro' && p.period === 'YEARLY')! : {} as PlatformPlan), [platformPlans])
  const enterprisePlatformPlan = useMemo(() => (platformPlans ? platformPlans.find(p => p.name === 'Enterprise')! : {} as PlatformPlan), [platformPlans])

  const { clusterMonthlyPricing, userMonthlyPricing } = useMemo(() => {
    if (!proPlatformPlan) return errorPricing

    const clusterMonthlyPricing = proPlatformPlan.lineItems?.find(x => x?.dimension === 'CLUSTER' && x?.period === 'MONTHLY')?.cost
    const userMonthlyPricing = proPlatformPlan.lineItems?.find(x => x?.dimension === 'USER' && x?.period === 'MONTHLY')?.cost

    return {
      clusterMonthlyPricing: clusterMonthlyPricing ? clusterMonthlyPricing / 100 : 0, // Stripe conventions are in cents
      userMonthlyPricing: userMonthlyPricing ? userMonthlyPricing / 100 : 0,
    }
  }, [proPlatformPlan])

  const platformPlansContextValue = useMemo<PlatformPlansContextType>(() => ({
    platformPlans,
    proPlatformPlan,
    proYearlyPlatformPlan,
    enterprisePlatformPlan,
    clusterMonthlyPricing,
    userMonthlyPricing,
    annualDiscount: 0.1, // Hardcoded for now
  }), [
    platformPlans,
    proPlatformPlan,
    proYearlyPlatformPlan,
    enterprisePlatformPlan,
    clusterMonthlyPricing,
    userMonthlyPricing,
  ])

  if (error) return <BillingError />
  if (loading) return <BillingLoading />
  if (!(platformPlans?.length && proPlatformPlan)) return <BillingError /> // The children should always have access to the core data

  return (
    <PlatformPlansContext.Provider value={platformPlansContextValue}>
      {children}
    </PlatformPlansContext.Provider>
  )
}

export default BillingPlatformPlansProvider
