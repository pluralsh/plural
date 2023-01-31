import { createContext } from 'react'

import { Card } from '../generated/graphql'

export type BillingBankCardContextType = {
  card: Card | null
  refetch: () => void
}

const BillingBankCardContext = createContext<BillingBankCardContextType>({
  card: null,
  refetch: () => {},
})

export default BillingBankCardContext
