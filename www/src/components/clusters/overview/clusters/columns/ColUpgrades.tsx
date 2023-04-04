import { Chip } from '@pluralsh/design-system'

import { columnHelper } from './misc'

export const ColUpgrades = columnHelper.accessor(row => row.delivered, {
  id: 'upgrades',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { delivered, mock } } }) => {
    if (mock) return <Chip severity="warning">Magical</Chip>

    return (
      <Chip
        severity={delivered ? 'success' : 'warning'}
        hue="lighter"
      >
        {delivered ? 'Delivered' : 'Pending'}
      </Chip>
    )
  },
  header: 'Upgrades',
})
