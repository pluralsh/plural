import { IconFrame, TerminalIcon } from '@pluralsh/design-system'

import { columnHelper } from './misc'

export const ColCloudshell = columnHelper.accessor(row => row.owner?.hasShell, {
  id: 'cloudshell',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { mock, owner } } }) => ((owner?.hasShell || mock)
    ? (
      <IconFrame
        clickable={!mock}
        icon={<TerminalIcon />}
        onClick={() => null} // TODO: Navigate to cloudshell.
        textValue="Go to cloudshell"
        tooltip={!mock}
        type="floating"
      />
    )
    : null),
  header: 'Cloudshell',
})
