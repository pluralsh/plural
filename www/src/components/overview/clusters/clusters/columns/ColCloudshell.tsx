import { IconFrame, TerminalIcon } from '@pluralsh/design-system'

import { columnHelper } from './misc'

export const ColCloudshell = columnHelper.accessor(row => row.owner?.hasShell, {
  id: 'cloudshell',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { owner } } }) => (owner?.hasShell
    ? (
      <IconFrame
        clickable
        icon={<TerminalIcon />}
        onClick={() => null} // TODO: Navigate to cloudshell.
        textValue="Go to cloudshell"
        tooltip
        type="floating"
      />
    )
    : null),
  header: 'Cloudshell',
})
