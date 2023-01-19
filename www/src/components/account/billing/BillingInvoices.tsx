import { Fragment, useMemo } from 'react'
import { Card } from '@pluralsh/design-system'
import { Div } from 'honorable'

function BillingInvoices() {
  const invoices = useMemo(() => [
    {
      id: 0,
      date: new Date().toISOString(),
      plan: 'Professional',
      amount: 1500,
    },
    {
      id: 1,
      date: new Date().toISOString(),
      plan: 'Professional',
      amount: 1250,
    },
    {
      id: 2,
      date: new Date().toISOString(),
      plan: 'Professional',
      amount: 1000,
    },
    {
      id: 3,
      date: new Date().toISOString(),
      plan: 'Professional',
      amount: 750,
    },
    {
      id: 4,
      date: new Date().toISOString(),
      plan: 'Professional',
      amount: 500,
    },
    {
      id: 5,
      date: new Date().toISOString(),
      plan: 'Professional',
      amount: 250,
    },
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
            padding="medium"
          >
            <Div>
              {invoice.date}
            </Div>
            <Div>
              {invoice.plan}
            </Div>
            <Div>
              {invoice.amount}
            </Div>
            <Div />
          </Div>
        ))}
      </Div>
    </Card>
  )
}

export default BillingInvoices
