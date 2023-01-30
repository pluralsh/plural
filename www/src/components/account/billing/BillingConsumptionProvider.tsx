import { ReactNode, useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client'

import CurrentUserContext from '../../../contexts/CurrentUserContext'
import BillingConsumptionContext, { BillingConsumptionContextType } from '../../../contexts/BillingConsumptionContext'

import { USERS_QUERY } from './queries'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

type BillingConsumptionProviderPropsType = {
  children: ReactNode
}

function BillingConsumptionProvider({ children }: BillingConsumptionProviderPropsType) {
  const { me } = useContext(CurrentUserContext)
  const { data, loading, error } = useQuery(USERS_QUERY)

  const nClusters = useMemo(() => (me?.account?.clusterCount ? parseInt(me?.account?.clusterCount) : 0), [me])
  const nUsers = useMemo(() => data?.users?.edges?.length ?? 0, [data])

  const billingConsumptionContextValue = useMemo<BillingConsumptionContextType>(() => ({
    nClusters,
    nUsers,
  }), [
    nClusters,
    nUsers,
  ])

  console.log('billingConsumptionContextValue', billingConsumptionContextValue)

  if (error) return <BillingError />
  if (loading) return <BillingLoading />

  return (
    <BillingConsumptionContext.Provider value={billingConsumptionContextValue}>
      {children}
    </BillingConsumptionContext.Provider>
  )
}

export default BillingConsumptionProvider
