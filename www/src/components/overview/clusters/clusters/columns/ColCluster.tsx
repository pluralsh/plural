import { AppIcon } from '@pluralsh/design-system'

import { ProviderIcon } from '../../../../utils/ProviderIcon'
import { Source } from '../../../../../generated/graphql'

import { CellCaption, CellWrap, columnHelper } from './misc'

const sourceDisplayNames = {
  [Source.Default]: 'CLI',
  [Source.Shell]: 'Cloud shell',
  [Source.Demo]: 'Demo',
}

export const ColCluster = columnHelper.accessor(row => row.name, {
  id: 'cluster',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { name, provider, source } } }) => (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={(
          <ProviderIcon
            provider={provider}
            width={16}
          />
        )}
      />
      <div>
        <div>{name}</div>
        <CellCaption>{sourceDisplayNames[source || '']}</CellCaption>
      </div>
    </CellWrap>
  ),
  header: 'Cluster',
})
