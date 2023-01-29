import { useMemo } from 'react'
import {
  Button,
  Card,
  Chip,
  DownloadIcon,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import moment from 'moment'

function BillingInvoices() {
  const invoices = useMemo<any[]>(() => [
    // Let's keep the commented code until data flows in
    // {
    //   id: 0,
    //   date: new Date().toISOString(),
    //   plan: 'Professional',
    //   amount: 1500,
    // },
    // {
    //   id: 1,
    //   date: new Date().toISOString(),
    //   plan: 'Professional',
    //   amount: 1250,
    // },
    // {
    //   id: 2,
    //   date: new Date().toISOString(),
    //   plan: 'Professional',
    //   amount: 1000,
    // },
    // {
    //   id: 3,
    //   date: new Date().toISOString(),
    //   plan: 'Professional',
    //   amount: 750,
    // },
    // {
    //   id: 4,
    //   date: new Date().toISOString(),
    //   plan: 'Professional',
    //   amount: 500,
    // },
    // {
    //   id: 5,
    //   date: new Date().toISOString(),
    //   plan: 'Professional',
    //   amount: 250,
    // },
  ], [])

  return (
    <Card>
      <Div
        display="grid"
        gridTemplateColumns="repeat(4, 1fr)"
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
          Plan
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
            key={invoice.id}
            backgroundColor={i % 2 ? 'fill-one' : 'fill-two'}
            display="grid"
            gridTemplateColumns="repeat(4, 1fr)"
            paddingVertical="xsmall"
            paddingHorizontal="medium"
          >
            <Flex align="center">
              {moment(invoice.date).format('MM/DD/YY')}
            </Flex>
            <Flex align="center">
              <Chip severity="info">
                {invoice.plan}
              </Chip>
            </Flex>
            <Flex align="center">
              ${invoice.amount}
            </Flex>
            <Flex justify="flex-end">
              <Button
                tertiary
                padding={0}
              >
                <DownloadIcon color="icon-light" />
              </Button>
            </Flex>
          </Div>
        ))}
      </Div>
    </Card>
  )
}

export default BillingInvoices
