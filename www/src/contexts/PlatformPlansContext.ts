import { createContext } from 'react'

import { PlatformPlan } from '../generated/graphql'

export type PlatformPlansContextType = {
  platformPlans: PlatformPlan[],
  proPlatformPlan: PlatformPlan,
  clusterMonthlyPricing: number
  userMonthlyPricing: number
  annualDiscount: number // Between 0 and 1, e.g. 0.2
}

const PlatformPlansContext = createContext<PlatformPlansContextType>({
  platformPlans: [],
  proPlatformPlan: {} as PlatformPlan,
  clusterMonthlyPricing: 0,
  userMonthlyPricing: 0,
  annualDiscount: 0,
})

export default PlatformPlansContext
