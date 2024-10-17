import {
  AppIcon,
  Button,
  Chip,
  CloudIcon,
  ConsoleIcon,
  Flex,
  ListBoxItem,
  PeopleIcon,
  Tooltip,
  TrashCanIcon,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import { ProviderIcon } from 'components/utils/ProviderIcon'

import {
  ConsoleInstanceFragment,
  ConsoleInstanceStatus,
  ConsoleInstanceType,
} from 'generated/graphql'

import { MoreMenu } from 'components/account/MoreMenu'
import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'
import { useCallback, useContext, useState } from 'react'
import { useTheme } from 'styled-components'

import { ClusterAdminsModal } from 'components/cluster/ClusterAdminsModal'

import { upperFirst } from 'lodash'

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

const ColStatus = columnHelper.accessor((instance) => instance.status, {
  id: 'status',
  header: 'Status',
  enableSorting: true,
  cell: ({ getValue }) => (
    <Chip
      css={{ width: 'max-content' }}
      severity={getStatusSeverity(getValue())}
    >
      {statusToLabel[getValue()]}
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

const ColHosting = columnHelper.accessor((instance) => instance.type, {
  id: 'hosting',
  header: 'Hosting',
  enableSorting: true,
  cell: ({ getValue }) => (
    <Chip
      css={{ width: 'max-content' }}
      severity={
        getValue() === ConsoleInstanceType.Dedicated ? 'info' : 'neutral'
      }
    >
      {upperFirst(getValue().toLowerCase())}
    </Chip>
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

enum MenuItemKey {
  EditSize = 'editSize',
  EditOidc = 'editOidc',
  EditPluralOIDCClients = 'editPluralOIDCClients',
  Delete = 'delete',
}

const ColActions = columnHelper.accessor((instance) => instance, {
  id: 'actions',
  header: '',
  meta: { gridTemplate: 'max-content' },
  cell: function Cell({ getValue }) {
    const theme = useTheme()
    const [menuKey, setMenuKey] = useState<Nullable<string>>('')
    const instance = getValue()
    const { refetchInstances } = useContext(ConsoleInstancesContext)
    const onClose = useCallback(() => setMenuKey(''), [])

    return (
      <Flex
        align="center"
        gap="small"
        justifyContent="flex-end"
        width="100%"
      >
        <ConsoleInstanceOIDC instance={instance} />
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
        <MoreMenu onSelectionChange={(newKey) => setMenuKey(newKey)}>
          <ListBoxItem
            key={MenuItemKey.EditSize}
            label="Edit cloud instance size"
            leftContent={<CloudIcon />}
          />
          <ListBoxItem
            key={MenuItemKey.EditOidc}
            label={
              <Tooltip label="Allow other team members to reconfigure this console instance">
                <span>Edit cluster managers</span>
              </Tooltip>
            }
          />
          <ListBoxItem
            key={MenuItemKey.EditPluralOIDCClients}
            label="Edit Plural OIDC clients"
            leftContent={<PeopleIcon />}
          />
          <ListBoxItem
            key={MenuItemKey.Delete}
            destructive
            label="Delete instance"
            leftContent={<TrashCanIcon color={'icon-danger'} />}
          />
        </MoreMenu>
        {/* Modals */}
        <EditInstanceSizeModal
          open={menuKey === MenuItemKey.EditSize}
          onClose={onClose}
          refetch={refetchInstances}
          instance={instance}
        />
        <ClusterAdminsModal
          open={menuKey === MenuItemKey.EditOidc}
          onClose={onClose}
          serviceAccount={instance.console?.owner}
          showHeading={false}
        />
        <EditPluralOIDCClientsModal
          open={menuKey === MenuItemKey.EditPluralOIDCClients}
          onClose={onClose}
          instance={instance}
        />
        <DeleteInstanceModal
          open={menuKey === MenuItemKey.Delete}
          onClose={onClose}
          refetch={refetchInstances}
          instance={instance}
        />
      </Flex>
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
