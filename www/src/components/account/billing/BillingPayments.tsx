import { Div } from 'honorable'

import BillingBankCards from './BillingBankCards'
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
      <BillingBankCards />
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
