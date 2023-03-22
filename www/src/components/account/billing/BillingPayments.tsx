import { Div } from 'honorable'

import { useContext } from 'react'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { usePaymentMethodsQuery } from '../../../generated/graphql'
import { LoopingLogo } from '../../utils/AnimatedLogo'

import BillingBankCards from './BillingBankCards'
import BillingInvoices from './BillingInvoices'

function BillingPayments() {
  const { billingCustomerId } = useContext(SubscriptionContext)
  const { data, error } = usePaymentMethodsQuery()

  console.log('data', data)
  console.log('error', error)
  const paymentMethods = data?.account?.paymentMethods?.edges?.map(edge => edge?.node)

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
