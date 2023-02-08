import { Div } from 'honorable'

import { useContext } from 'react'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import BillingBankCards from './BillingBankCards'
import BillingInvoices from './BillingInvoices'

function BillingPayments() {
  const { isPaidPlan } = useContext(SubscriptionContext)

  return (
    <>
      <Div
        subtitle1
        marginBottom="medium"
      >
        Payment info
      </Div>
      <BillingBankCards />
      {isPaidPlan && (
        <>
          <Div
            subtitle1
            marginTop="xlarge"
            marginBottom="medium"
          >
            Invoices
          </Div>
          <BillingInvoices />
        </>
      )}
    </>
  )
}

export default BillingPayments
