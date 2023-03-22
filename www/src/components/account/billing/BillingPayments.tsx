import { Div } from 'honorable'

import { useContext } from 'react'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { LoopingLogo } from '../../utils/AnimatedLogo'

import BillingBankCards from './BillingBankCards'
import BillingInvoices from './BillingInvoices'
import { usePaymentMethods } from './PaymentMethodsContext'

function BillingPayments() {
  const { billingCustomerId } = useContext(SubscriptionContext)
  const { paymentMethods } = usePaymentMethods()

  if (!paymentMethods) {
    return <LoopingLogo />
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
