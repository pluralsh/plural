import { createContext } from 'react'

import { PlatformPlan } from '../generated/graphql'

export type PlatformPlansContextType = {
  platformPlans: PlatformPlan[]
  proPlatformPlan: PlatformPlan
  proYearlyPlatformPlan: PlatformPlan
  enterprisePlatformPlan: PlatformPlan
  clusterMonthlyPricing: number
  userMonthlyPricing: number
  annualDiscount: number
}

const PlatformPlansContext = createContext<PlatformPlansContextType>({
  platformPlans: [],
  proPlatformPlan: {} as PlatformPlan,
  proYearlyPlatformPlan: {} as PlatformPlan,
  enterprisePlatformPlan: {} as PlatformPlan,
  clusterMonthlyPricing: 0,
  userMonthlyPricing: 0,
  annualDiscount: 0,
})

export default PlatformPlansContext
