import ClusterHealth from '../../ClusterHealth'

import { columnHelper } from './misc'

export const ColHealth = columnHelper.accessor(row => row.pingedAt, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { pingedAt } } }) => <ClusterHealth pingedAt={pingedAt} />,
  header: 'Health',
})
