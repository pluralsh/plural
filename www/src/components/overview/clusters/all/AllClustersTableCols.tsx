import {
  Button,
  CaretRightIcon,
  Chip,
  ConsoleIcon,
  Flex,
  IconFrame,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'

import {
  ClusterFragment,
  ConsoleInstanceStatus,
  UserFragment,
} from 'generated/graphql'

import { useTheme } from 'styled-components'

import { Link } from 'react-router-dom'
import ClusterHealth from '../ClusterHealth'
import {
  InstanceDisplay,
  StatusChip,
} from '../plural-cloud/CloudInstanceTableCols'
import { CellCaption, ClusterDisplay } from '../SelfHostedTableCols'
import { ClusterListElement } from '../clusterListUtils'

export enum CombinedClusterType {
  PluralCloud = 'Plural cloud',
  SelfHosted = 'Self hosted',
}

export type CombinedClusterT =
  | {
      type: CombinedClusterType.PluralCloud
      status: ConsoleInstanceStatus
      id: string
      name: string
      owner: Nullable<UserFragment>
      consoleUrl: Nullable<string>
    }
  | ({ type: CombinedClusterType.SelfHosted } & ClusterListElement)

const columnHelper = createColumnHelper<CombinedClusterT>()

const ColCluster = columnHelper.accessor(({ name }) => name, {
  id: 'cluster',
  header: 'Cluster',
  enableSorting: true,
  meta: { gridTemplate: '1fr' },
  cell: ({ row }) => {
    const { type } = row.original

    return type === CombinedClusterType.PluralCloud ? (
      <InstanceDisplay name={row.original.name} />
    ) : (
      <ClusterDisplay cluster={row.original} />
    )
  },
})

const ColType = columnHelper.accessor(({ type }) => type, {
  id: 'type',
  header: 'Type',
  enableSorting: true,
  cell: ({ getValue }) => {
    const type = getValue()
    return (
      <Chip
        css={{ whiteSpace: 'nowrap' }}
        severity={type === CombinedClusterType.PluralCloud ? 'info' : 'neutral'}
      >
        {type}
      </Chip>
    )
  },
})

const ColStatus = columnHelper.accessor((row) => row, {
  id: 'status',
  header: 'Status',
  cell: ({ getValue }) => {
    const row = getValue()

    return row.type === CombinedClusterType.PluralCloud ? (
      <StatusChip status={row.status} />
    ) : (
      <ClusterHealth pingedAt={row.pingedAt} />
    )
  },
})

const ColOwner = columnHelper.accessor((row) => row.owner, {
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
  meta: { gridTemplate: 'max-content' },
  cell: function Cell({ getValue }) {
    const theme = useTheme()
    const instance = getValue()

    return (
      <Flex
        gap="small"
        justify="flex-end"
        width="100%"
      >
        {(instance.type === CombinedClusterType.SelfHosted ||
          instance.status === ConsoleInstanceStatus.Provisioned) && (
          <Button
            secondary
            small
            startIcon={<ConsoleIcon />}
            as={Link}
            to={sanitizeConsoleUrl(instance.consoleUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Go to Console
          </Button>
        )}
        <IconFrame
          clickable
          tooltip="View instance details"
          icon={<CaretRightIcon />}
        />
      </Flex>
    )
  },
})

export const allClustersCols = [
  ColCluster,
  ColType,
  ColStatus,
  ColOwner,
  ColActions,
]

export const sanitizeConsoleUrl = (url: Nullable<string>) =>
  url ? `https://${url.replace(/^https?:\/\//, '')}` : ''
