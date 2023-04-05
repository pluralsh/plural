import { AppIcon } from '@pluralsh/design-system'

import { CellCaption, CellWrap, columnHelper } from './misc'

export const ColOwner = columnHelper.accessor(row => row.owner?.name, {
  id: 'owner',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { owner, mock } } }) => (
    <CellWrap>
      <AppIcon
        name={owner?.name}
        url={owner?.avatar || undefined}
        size="xxsmall"
        spacing={mock ? 'none' : undefined}
      />
      <div>
        <div>{owner?.name}</div>
        <CellCaption>{owner?.email}</CellCaption>
      </div>
    </CellWrap>
  ),
  header: 'Owner',
})
