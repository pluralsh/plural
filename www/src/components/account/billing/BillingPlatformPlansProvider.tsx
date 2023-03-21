import { ReactNode, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { isEmpty } from 'lodash'

import { PlatformPlan } from '../../../generated/graphql'
import PlatformPlansContext, { PlatformPlansContextType } from '../../../contexts/PlatformPlansContext'
import LoadingIndicator from '../../utils/LoadingIndicator'

import { PLATFORM_PLANS_QUERY } from './queries'
import BillingError from './BillingError'

type BillingPlatformPlansProviderPropsType = {
  children: ReactNode
}

function BillingPlatformPlansProvider({ children }: BillingPlatformPlansProviderPropsType) {
  const { data, loading, error } = useQuery(PLATFORM_PLANS_QUERY)

  const platformPlansContextValue = useMemo<PlatformPlansContextType>(() => {
    const platformPlans = data?.platformPlans as PlatformPlan[]
    const proPlatformPlan = platformPlans
      ?.find(({ name, period }) => name === 'Pro' && period === 'MONTHLY') || {} as PlatformPlan
    const proYearlyPlatformPlan = platformPlans
      ?.find(({ name, period }) => name === 'Pro' && period === 'YEARLY') || {} as PlatformPlan

    let clusterMonthlyPricing = 0
    let userMonthlyPricing = 0

    if (proPlatformPlan) {
      const clusterMPCents = proPlatformPlan.lineItems
        ?.find(x => x?.dimension === 'CLUSTER' && x?.period === 'MONTHLY')?.cost || 0
      const userMPCents = proPlatformPlan.lineItems
        ?.find(x => x?.dimension === 'USER' && x?.period === 'MONTHLY')?.cost || 0

      clusterMonthlyPricing = clusterMPCents / 100
      userMonthlyPricing = userMPCents / 100
    }

    return {
      platformPlans,
      proPlatformPlan,
      proYearlyPlatformPlan,
      clusterMonthlyPricing,
      userMonthlyPricing,
      annualDiscount: 0.1, // Hardcoded for now
    }
  }, [data])

  if (error) return <BillingError />
  if (!data && loading) return <LoadingIndicator />
  if (isEmpty(platformPlansContextValue?.platformPlans)) return <BillingError /> // The children should always have access to the core data

  return (
    <PlatformPlansContext.Provider value={platformPlansContextValue}>
      {children}
    </PlatformPlansContext.Provider>
  )
}

export default BillingPlatformPlansProvider
