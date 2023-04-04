import { GitHubIcon, IconFrame } from '@pluralsh/design-system'

import CopyButton from '../../../../utils/CopyButton'

import { columnHelper } from './misc'

export const ColGit = columnHelper.accessor(row => row.gitUrl, {
  id: 'git',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { gitUrl, mock } } }) => (mock
    ? (
      <IconFrame
        icon={<GitHubIcon />}
        textValue=""
        type="floating"
      />
    )
    : <CopyButton text={gitUrl || ''} />),
  header: 'Git',
})
