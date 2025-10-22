import {
  AppIcon,
  Button,
  CaretRightIcon,
  ConsoleIcon,
  IconFrame,
  TerminalIcon,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import { A, Div } from 'honorable'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { Source } from '../../../generated/graphql'
import { ProviderIcon } from '../../utils/ProviderIcon'

import ClusterHealth from './ClusterHealth'
import ClusterOwner from './ClusterOwner'
import { sanitizeConsoleUrl } from './all/AllClustersTableCols'
import { ClusterListElement } from './clusterListUtils'

const clusterExists = (row: ClusterListElement): boolean =>
  row.pingedAt !== null

export const columnHelper = createColumnHelper<ClusterListElement>()

export const CellWrap = styled.div(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing.small,
}))

export const CellCaption = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
}))

const sourceDisplayNames = {
  [Source.Default]: 'CLI',
  [Source.Shell]: 'Cloud shell',
  [Source.Demo]: 'Demo',
}

export function ClusterDisplay({ cluster }: { cluster: ClusterListElement }) {
  const { id, name, provider, source, accessible, pingedAt } = cluster

  return (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={
          <ProviderIcon
            provider={provider}
            width={16}
          />
        }
      />
      <div>
        {accessible && clusterExists({ pingedAt } as ClusterListElement) ? (
          <A
            as={Link}
            to={`/clusters/${id}`}
            whiteSpace="nowrap"
          >
            {name}
          </A>
        ) : (
          <Div whiteSpace="nowrap">{name}</Div>
        )}
        <CellCaption>{sourceDisplayNames[source || '']}</CellCaption>
      </div>
    </CellWrap>
  )
}

export const ColCluster = columnHelper.accessor((row) => row.name, {
  id: 'cluster',
  meta: { gridTemplate: '3fr' },
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row }) => <ClusterDisplay cluster={row.original} />,
  header: 'Cluster',
})

export const ColHealth = columnHelper.accessor((row) => row.pingedAt, {
  id: 'health',
  meta: { gridTemplate: '1fr' },
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { pingedAt },
    },
  }) => <ClusterHealth pingedAt={pingedAt} />,
  header: 'Health',
})

export const ColOwner = columnHelper.accessor((row) => row.owner?.name, {
  id: 'owner',
  meta: { gridTemplate: '2fr' },
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { owner },
    },
  }) => (
    <ClusterOwner
      name={owner?.name}
      email={owner?.email}
      avatar={owner?.avatar}
    />
  ),
  header: 'Owner',
})

const ActionsWrap = styled(CellWrap)({ alignSelf: 'end' })

export const ColActions = columnHelper.accessor((row) => row.consoleUrl, {
  id: 'actions',
  header: '',
  meta: { gridTemplate: 'max-content' },
  enableGlobalFilter: false,
  enableSorting: false,
  cell: function Cell({ row: { original: row } }) {
    const theme = useTheme()

    return (
      <ActionsWrap>
        {!row.owner?.hasShell && row.accessible && (
          <Button
            small
            secondary
            startIcon={<TerminalIcon color={theme.colors['icon-default']} />}
            as="a"
            href={`/shell?user=${row.owner?.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloud shell
          </Button>
        )}
        {row.consoleUrl && (
          <Button
            small
            secondary
            startIcon={<ConsoleIcon color={theme.colors['icon-default']} />}
            as="a"
            href={sanitizeConsoleUrl(row.consoleUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Go to Console
          </Button>
        )}

        {row.accessible && clusterExists(row) ? (
          <IconFrame
            clickable
            size="medium"
            icon={<CaretRightIcon />}
            as={Link}
            to={`/clusters/${row.id}`}
            textValue="Go to cluster details"
            tooltip
            type="tertiary"
            style={{
              display: 'flex',
            }}
          />
        ) : (
          <IconFrame
            size="medium"
            icon={<CaretRightIcon color="icon-disabled" />}
            textValue={
              !clusterExists(row)
                ? ''
                : "You aren't an administrator of this cluster"
            }
            tooltip
            type="tertiary"
          />
        )}
      </ActionsWrap>
    )
  },
})
