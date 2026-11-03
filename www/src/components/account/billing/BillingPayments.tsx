import { useMemo } from 'react'
import { useTheme } from 'styled-components'

import { useInvoicesQuery } from '../../../generated/graphql'

import LoadingIndicator from '../../utils/LoadingIndicator'
import { Subtitle1H1 } from '../../utils/Typography'

import BillingBankCards from './BillingBankCards'
import BillingInvoices from './BillingInvoices'
import { useBillingSubscription } from './BillingSubscriptionProvider'

function BillingPayments() {
  const theme = useTheme()
  const { billingCustomerId, paymentMethods } = useBillingSubscription()
  const { data: invoicesData, loading: invoicesLoading } = useInvoicesQuery()

  const invoicesWithIds = useMemo(
    () =>
      invoicesData?.invoices?.edges?.map((e, i) =>
        e?.node
          ? {
              id: `${e?.node?.hostedInvoiceUrl || i}`,
              ...e?.node,
            }
          : undefined
      ),
    [invoicesData]
  )

  if (!paymentMethods || (billingCustomerId && invoicesLoading)) {
    return <LoadingIndicator />
  }

  return (
    <>
      <Subtitle1H1
        as="h2"
        css={{ marginBottom: theme.spacing.medium }}
      >
        Payment info
      </Subtitle1H1>
      <BillingBankCards
        paymentMethods={paymentMethods}
        invoices={invoicesWithIds}
      />
      {billingCustomerId && invoicesWithIds && (
        <>
          <Subtitle1H1
            as="h2"
            css={{
              marginTop: theme.spacing.xlarge,
              marginBottom: theme.spacing.medium,
            }}
          >
            Invoices
          </Subtitle1H1>
          <BillingInvoices invoices={invoicesWithIds} />
        </>
      )}
    </>
  )
}

export default BillingPayments
