import {
  Button,
  Card,
  DocumentIcon,
  EmptyState,
  Table,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import moment from 'moment'
import { createColumnHelper } from '@tanstack/react-table'

import capitalize from 'lodash/capitalize'
import isEmpty from 'lodash/isEmpty'

import { InvoiceFragment } from '../../../generated/graphql'

const columnHelper = createColumnHelper<InvoiceFragment & { id: string }>()

const columns = [
  columnHelper.accessor((row) => row.createdAt, {
    id: 'date',
    enableSorting: true,
    cell: (info) => moment(info.getValue()).format('MM/DD/YY'),
    header: () => <>Date</>,
  }),
  columnHelper.accessor((row) => row.amountDue, {
    id: 'amountDue',
    enableSorting: true,
    cell: (info) => `$${(info.getValue() / 100).toFixed(2)}`,
    header: () => <>Amount due</>,
  }),
  columnHelper.accessor((row) => row.amountPaid, {
    id: 'amountPaid',
    enableSorting: true,
    cell: (info) => `$${(info.getValue() / 100).toFixed(2)}`,
    header: () => <>Amount paid</>,
  }),
  columnHelper.accessor((row) => row.status, {
    id: 'status',
    enableSorting: true,
    cell: (info) => capitalize(info.getValue() || ''),
    header: () => <>Status</>,
  }),
  columnHelper.accessor((row) => row.hostedInvoiceUrl, {
    id: 'viewInvoice',
    cell: (info) => (
      <Flex
        width="100%"
        justifyContent="flex-end"
      >
        <Button
          as="a"
          href={info.getValue()}
          target="_blank"
          rel="noopener noreferer"
          secondary
          small
          padding={0}
          startIcon={<DocumentIcon />}
        >
          View/pay invoice
        </Button>
      </Flex>
    ),
    header: () => <Div />,
  }),
]

function BillingInvoices({
  invoices,
}: {
  invoices: (InvoiceFragment | null | undefined)[]
}) {
  if (isEmpty(invoices)) {
    return (
      <Card>
        <EmptyState message="No invoices created yet" />
      </Card>
    )
  }

  return (
    <Table
      loose
      data={invoices || []}
      columns={columns}
    />
  )
}

export default BillingInvoices
