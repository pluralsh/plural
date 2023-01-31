import { useCallback, useMemo } from 'react'
import { Button, Card, DownloadIcon } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import moment from 'moment'
import { useQuery } from '@apollo/client'

import { Invoice } from '../../../generated/graphql'

import { INVOICES_QUERY } from './queries'
import BillingError from './BillingError'
import BillingLoading from './BillingLoading'

function BillingInvoices() {
  const { data, loading, error } = useQuery(INVOICES_QUERY)

  const invoices = useMemo(() => data?.invoices?.edges?.map(e => e.node) as Invoice[], [data])

  const renderContent = useCallback(() => (
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
        {invoices.map((invoice, i) => (
          <Div
            key={invoice.number}
            backgroundColor={i % 2 ? 'fill-one' : 'fill-two'}
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            paddingVertical="xsmall"
            paddingHorizontal="medium"
          >
            <Flex align="center">
              {moment(invoice.createdAt).format('MM/DD/YY')}
            </Flex>
            <Flex align="center">
              ${invoice.amountPaid / 100}
            </Flex>
            <Flex justify="flex-end">
              <Button
                as="a"
                href={invoice.hostedInvoiceUrl}
                target="_blank"
                rel="noopener noreferer"
                tertiary
                padding={0}
              >
                <DownloadIcon color="icon-light" />
              </Button>
            </Flex>
          </Div>
        ))}
      </Div>
    </>
  ), [invoices])

  return (
    <Card>
      {error ? <BillingError /> : loading ? <BillingLoading /> : renderContent()}
    </Card>
  )
}

export default BillingInvoices
