import { Div } from 'honorable'

import LoadingIndicator from '../../utils/LoadingIndicator'

import BillingBankCards from './BillingBankCards'
import BillingInvoices from './BillingInvoices'
import { useBillingSubscription } from './BillingSubscriptionProvider'

function BillingPayments() {
  const { billingCustomerId, paymentMethods } = useBillingSubscription()

  if (!paymentMethods) {
    return <LoadingIndicator />
  }

  return (
    <>
      <Div
        subtitle1
        marginBottom="medium"
      >
        Payment info
      </Div>
      <BillingBankCards paymentMethods={paymentMethods} />
      {billingCustomerId && (
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
