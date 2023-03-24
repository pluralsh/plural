import { useMemo } from 'react'
import { Button, Card, DocumentIcon } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import moment from 'moment'

import { type InvoiceFragment, useInvoicesQuery } from '../../../generated/graphql'

import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

function InvoiceLine({ invoice, i }: { invoice: InvoiceFragment; i: number }) {
  return (
    <Div
      key={invoice.number}
      backgroundColor={i % 2 ? 'fill-one' : 'fill-two'}
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
      paddingVertical="xsmall"
      paddingHorizontal="medium"
    >
      <Flex align="center">{moment(invoice.createdAt).format('MM/DD/YY')}</Flex>
      <Flex align="center">${invoice.amountPaid / 100}</Flex>
      <Flex justify="flex-end">
        <Button
          as="a"
          href={invoice.hostedInvoiceUrl}
          target="_blank"
          rel="noopener noreferer"
          tertiary
          padding={0}
          startIcon={<DocumentIcon />}
        >
          View invoice
        </Button>
      </Flex>
    </Div>
  )
}

function BillingInvoices() {
  const { data, loading, error } = useInvoicesQuery()

  const invoices = useMemo(() => data?.invoices?.edges?.map(e => e?.node),
    [data])

  let content

  if (error) {
    content = <BillingError />
  }
  else if (loading) {
    content = <BillingLoading />
  }
  else {
    content = (
      <>
        <Div
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          padding="medium"
        >
          <Div
            body2
            fontWeight={600}
          >
            Date
          </Div>
          <Div
            body2
            fontWeight={600}
          >
            Amount
          </Div>
        </Div>
        <Div>
          {invoices?.map((invoice, i) => invoice && (
            <InvoiceLine
              key={invoice.number}
              i={i}
              invoice={invoice}
            />
          ))}
        </Div>
      </>
    )
  }

  return <Card>{content}</Card>
}

export default BillingInvoices
