import { ReactNode, useContext, useMemo } from 'react'

import BillingConsumptionContext, { BillingConsumptionContextType } from '../../../contexts/BillingConsumptionContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'

type BillingConsumptionProviderPropsType = {
  children: ReactNode
}

function BillingConsumptionProvider({ children }: BillingConsumptionProviderPropsType) {
  const { account } = useContext(SubscriptionContext)

  const nClusters = useMemo(() => (account?.clusterCount ? parseInt(account.clusterCount) : 0), [account])
  const nUsers = useMemo(() => (account?.userCount ? parseInt(account.userCount) : 0), [account])

  const billingConsumptionContextValue = useMemo<BillingConsumptionContextType>(() => ({
    nClusters,
    nUsers,
  }), [
    nClusters,
    nUsers,
  ])

  return (
    <BillingConsumptionContext.Provider value={billingConsumptionContextValue}>
      {children}
    </BillingConsumptionContext.Provider>
  )
}

export default BillingConsumptionProvider
