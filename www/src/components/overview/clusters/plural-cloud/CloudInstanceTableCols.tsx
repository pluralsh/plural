import {
  AppIcon,
  Button,
  Chip,
  ConsoleIcon,
  Flex,
  ListBoxItem,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import { ProviderIcon } from 'components/utils/ProviderIcon'

import {
  ConsoleInstanceFragment,
  ConsoleInstanceStatus,
} from 'generated/graphql'

import { MoreMenu } from 'components/account/MoreMenu'
import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'
import { useCallback, useContext, useState } from 'react'
import { useTheme } from 'styled-components'

import { ClusterAdminsModal } from 'components/cluster/ClusterAdminsModal'

import { CellCaption, CellWrap } from '../SelfHostedTableCols'

import { ConsoleInstanceOIDC } from './ConsoleInstanceOIDC'
import { DeleteInstanceModal } from './DeleteInstance'
import { EditInstanceSizeModal } from './EditInstance'

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

const ColInstance = columnHelper.accessor((instance) => instance.name, {
  id: 'instance',
  header: 'Instance',
  enableSorting: true,
  meta: { gridTemplate: '1fr' },
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
      {firstLetterUppercase(getValue())}
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
  cell: ({ getValue }) => firstLetterUppercase(getValue()),
})

const ColOwner = columnHelper.accessor((instance) => instance.owner, {
  id: 'owner',
  header: 'Owner',
  meta: { gridTemplate: '1fr' },
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
          <span
            css={{
              color: theme.colors['text-primary-accent'],
            }}
          >
            Go to Console
          </span>
        </Button>
        <MoreMenu onSelectionChange={(newKey) => setMenuKey(newKey)}>
          <ListBoxItem
            key={MenuItemKey.EditSize}
            label="Edit instance size"
            textValue="Edit instance size"
          />
          <ListBoxItem
            key={MenuItemKey.EditOidc}
            label="Edit cluster managers"
            textValue="Edit cluster managers"
          />
          <ListBoxItem
            key={MenuItemKey.Delete}
            destructive
            label="Delete instance"
            textValue="Delete instance"
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
  ColRegion,
  ColSize,
  ColOwner,
  ColActions,
]
