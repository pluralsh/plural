import { createContext } from 'react'

export type BillingConsumptionContextType = {
  nClusters: number
  nUsers: number
}

const BillingConsumptionContext = createContext<BillingConsumptionContextType>({
  nClusters: 0,
  nUsers: 0,
})

export default BillingConsumptionContext
