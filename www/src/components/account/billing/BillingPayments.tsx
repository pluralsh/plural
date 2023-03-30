import { useMemo } from 'react'
import { H2 } from 'honorable'

import { useInvoicesQuery } from '../../../generated/graphql'

import LoadingIndicator from '../../utils/LoadingIndicator'

import BillingBankCards from './BillingBankCards'
import BillingInvoices from './BillingInvoices'
import { useBillingSubscription } from './BillingSubscriptionProvider'

function BillingPayments() {
  const { billingCustomerId, paymentMethods } = useBillingSubscription()
  const { data: invoicesData, loading: invoicesLoading } = useInvoicesQuery()

  const invoicesWithIds = useMemo(() => invoicesData?.invoices?.edges?.map((e, i) => (e?.node ? {
    id: `${e?.node?.hostedInvoiceUrl || i}`,
    ...e?.node,
  } : undefined)),
  [invoicesData])

  if (!paymentMethods || (billingCustomerId && invoicesLoading)) {
    return <LoadingIndicator />
  }

  return (
    <>
      <H2
        subtitle1
        marginBottom="medium"
      >
        Payment info
      </H2>
      <BillingBankCards
        paymentMethods={paymentMethods}
        invoices={invoicesWithIds}
      />
      {billingCustomerId && invoicesWithIds && (
        <>
          <H2
            subtitle1
            marginTop="xlarge"
            marginBottom="medium"
          >
            Invoices
          </H2>
          <BillingInvoices invoices={invoicesWithIds} />
        </>
      )}
    </>
  )
}

export default BillingPayments
