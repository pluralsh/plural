import { AppIcon, Chip, ConsoleIcon, Flex } from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import { ProviderIcon } from 'components/utils/ProviderIcon'

import {
  ConsoleInstanceFragment,
  ConsoleInstanceStatus,
} from 'generated/graphql'

import { CellCaption, CellWrap } from '../SelfHostedTableCols'

const columnHelper = createColumnHelper<ConsoleInstanceFragment>()

const formatStr = (string: Nullable<string>) =>
  string && string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()

function getStatusSeverity(
  status: ConsoleInstanceStatus
): 'success' | 'info' | 'danger' {
  switch (status) {
    case ConsoleInstanceStatus.Provisioned:
      return 'success'
    case ConsoleInstanceStatus.DeploymentDeleted ||
      ConsoleInstanceStatus.DatabaseDeleted:
      return 'danger'
    default:
      return 'info'
  }
}

const ColInstance = columnHelper.accessor((instance) => instance.name, {
  id: 'instance',
  header: 'Instance',
  enableSorting: true,
  cell: ({ getValue }) => (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={<ConsoleIcon />}
      />
      <div>
        <span>{getValue()}</span>
        <CellCaption>Plural Cloud</CellCaption>
      </div>
    </CellWrap>
  ),
})

const ColStatus = columnHelper.accessor((instance) => instance.status, {
  id: 'status',
  header: 'Status',
  enableSorting: true,
  cell: ({ getValue }) => (
    <Chip severity={getStatusSeverity(getValue())}>
      {formatStr(getValue())}
    </Chip>
  ),
})

const ColCloud = columnHelper.accessor((instance) => instance.cloud, {
  id: 'cloud',
  header: 'Cloud',
  enableSorting: true,
  cell: ({ getValue }) => (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={
          <ProviderIcon
            provider={getValue()}
            width={16}
          />
        }
      />
      {getValue()}
    </CellWrap>
  ),
})

const ColRegion = columnHelper.accessor((instance) => instance.region, {
  id: 'region',
  header: 'Region',
  enableSorting: true,
  cell: ({ getValue }) => getValue(),
})

const ColSize = columnHelper.accessor((instance) => instance.size, {
  id: 'size',
  header: 'Size',
  enableSorting: true,
  cell: ({ getValue }) => formatStr(getValue()),
})

const ColOwner = columnHelper.accessor((instance) => instance.owner, {
  id: 'owner',
  header: 'Owner',
  enableSorting: true,
  sortingFn: (rowA, rowB) =>
    (rowA.original.owner?.name ?? '') < (rowB.original.owner?.name ?? '')
      ? -1
      : 1,
  cell: ({ getValue }) => (
    <Flex direction="column">
      <span>{getValue()?.name}</span>
      <CellCaption>{getValue()?.email}</CellCaption>
    </Flex>
  ),
})

const ColActions = columnHelper.accessor((instance) => instance, {
  id: 'actions',
  header: '',
  cell: ({ getValue }) => <div>actions</div>,
})

export const cloudInstanceCols = [
  ColInstance,
  ColStatus,
  ColCloud,
  ColRegion,
  ColSize,
  ColOwner,
  // ColActions,
]
