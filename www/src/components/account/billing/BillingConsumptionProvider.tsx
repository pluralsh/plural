import { ReactNode, useContext, useMemo } from 'react'

import CurrentUserContext from '../../../contexts/CurrentUserContext'
import BillingConsumptionContext, { BillingConsumptionContextType } from '../../../contexts/BillingConsumptionContext'

type BillingConsumptionProviderPropsType = {
  children: ReactNode
}

function BillingConsumptionProvider({ children }: BillingConsumptionProviderPropsType) {
  const { me } = useContext(CurrentUserContext)

  const nClusters = useMemo(() => (me?.account?.clusterCount ? parseInt(me?.account?.clusterCount) : 0), [me])
  const nUsers = useMemo(() => (me?.account?.userCount ? parseInt(me?.account?.userCount) : 0), [me])

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
