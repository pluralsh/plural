import { Div } from 'honorable'

import BillingBankCard from './BillingBankCard'
import BillingInvoices from './BillingInvoices'

function BillingPayments() {
  return (
    <>
      <Div
        subtitle1
        marginBottom="medium"
      >
        Payment info
      </Div>
      <BillingBankCard />
      <Div
        subtitle1
        marginTop="xlarge"
        marginBottom="medium"
      >
        Invoices
      </Div>
      <BillingInvoices />
    </>
  )
}

export default BillingPayments
