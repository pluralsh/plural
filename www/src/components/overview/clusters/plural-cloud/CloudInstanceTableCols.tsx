import {
  AppIcon,
  Button,
  Chip,
  CloudIcon,
  ConsoleIcon,
  Flex,
  ListBoxItem,
  PeopleIcon,
  PersonPlusIcon,
  Tooltip,
  TrashCanIcon,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'

import { MoreMenu } from 'components/account/MoreMenu'

import { ClusterAdminsModal } from 'components/cluster/ClusterAdminsModal'
import { ProviderIcon } from 'components/utils/ProviderIcon'
import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import {
  ConsoleInstanceFragment,
  ConsoleInstanceStatus,
  ConsoleInstanceType,
} from 'generated/graphql'

import { capitalize } from 'lodash'
import { useCallback, useContext, useState } from 'react'
import { useTheme } from 'styled-components'
import useImpersonatedServiceAccount from '../../../../hooks/useImpersonatedServiceAccount'

import { CellCaption, CellWrap } from '../SelfHostedTableCols'

import { ConsoleInstanceOIDC } from './ConsoleInstanceOIDC'
import { DeleteInstanceModal } from './DeleteInstance'
import { EditInstanceSizeModal } from './EditInstance'
import { EditPluralOIDCClientsModal } from './EditPluralOIDCClients'

const columnHelper = createColumnHelper<ConsoleInstanceFragment>()

export const firstLetterUppercase = (string: Nullable<string>) =>
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

export const statusToLabel = {
  [ConsoleInstanceStatus.DatabaseCreated]: 'Database Created',
  [ConsoleInstanceStatus.DatabaseDeleted]: 'Database Deleted',
  [ConsoleInstanceStatus.DeploymentCreated]: 'Deployment Created',
  [ConsoleInstanceStatus.DeploymentDeleted]: 'Deployment Deleted',
  [ConsoleInstanceStatus.Pending]: 'Pending',
  [ConsoleInstanceStatus.Provisioned]: 'Provisioned',
  [ConsoleInstanceStatus.StackCreated]: 'Stack Created',
  [ConsoleInstanceStatus.StackDeleted]: 'Stack Deleted',
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
      {getValue()}
    </CellWrap>
  ),
})

export function StatusChip({ status }: { status: ConsoleInstanceStatus }) {
  return (
    <Chip
      css={{ width: 'max-content' }}
      severity={getStatusSeverity(status)}
    >
      {statusToLabel[status]}
    </Chip>
  )
}

const ColStatus = columnHelper.accessor((instance) => instance.status, {
  id: 'status',
  header: 'Status',
  enableSorting: true,
  cell: ({ getValue }) => <StatusChip status={getValue()} />,
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

export function HostingChip({ type }: { type: ConsoleInstanceType }) {
  return (
    <Chip
      css={{ width: 'max-content' }}
      severity={type === ConsoleInstanceType.Dedicated ? 'info' : 'neutral'}
    >
      {capitalize(type)}
    </Chip>
  )
}
const ColHosting = columnHelper.accessor((instance) => instance.type, {
  id: 'hosting',
  header: 'Hosting',
  enableSorting: true,
  cell: ({ getValue }) => <HostingChip type={getValue()} />,
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
  cell: ({ getValue }) => firstLetterUppercase(getValue()),
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
  meta: { gridTemplate: 'max-content' },
  cell: function Cell({ getValue }) {
    const theme = useTheme()
    const instance = getValue()

    return (
      <Button
        secondary
        startIcon={<ConsoleIcon color={theme.colors['icon-default']} />}
        as="a"
        href={`https://${instance.url}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Go to Console
      </Button>
    )
  },
})

export const cloudInstanceCols = [
  ColInstance,
  ColStatus,
  ColCloud,
  ColHosting,
  ColRegion,
  ColSize,
  ColOwner,
  ColActions,
]
