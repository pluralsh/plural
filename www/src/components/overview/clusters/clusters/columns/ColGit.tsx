import CopyButton from '../../../../utils/CopyButton'

import { columnHelper } from './misc'

export const ColGit = columnHelper.accessor(row => row.gitUrl, {
  id: 'git',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { gitUrl } } }) => <CopyButton text={gitUrl || ''} />,
  header: 'Git',
})
