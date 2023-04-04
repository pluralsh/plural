import { Chip } from '@pluralsh/design-system'

import ClusterHealth from '../../../ClusterHealth'

import { columnHelper } from './misc'

export const ColHealth = columnHelper.accessor(row => row.pingedAt, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { pingedAt, mock } } }) => (mock
    ? <Chip severity="success">Enchanted</Chip>
    : <ClusterHealth pingedAt={pingedAt} />),
  header: 'Health',
})
