import { ReactNode, useMemo } from 'react'
import { useQuery } from '@apollo/client'

import BillingBankCardContext, { BillingBankCardContextType } from '../../../contexts/BillingBankCardContext'

import { CARDS_QUERY } from './queries'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

type BillingBankCardProviderPropsType = {
  children: ReactNode
}

function BillingBankCardProvider({ children }: BillingBankCardProviderPropsType) {
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(CARDS_QUERY, {
    fetchPolicy: 'network-only',
  })

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node, [data])

  const billingBankCardContextValue = useMemo<BillingBankCardContextType>(() => ({
    card,
    refetch,
  }), [
    card,
    refetch,
  ])

  if (error) return <BillingError />
  if (loading) return <BillingLoading />

  return (
    <BillingBankCardContext.Provider value={billingBankCardContextValue}>
      {children}
    </BillingBankCardContext.Provider>
  )
}

export default BillingBankCardProvider
