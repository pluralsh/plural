import {
  AppIcon,
  Button,
  CaretRightIcon,
  Chip,
  ClusterIcon,
  GitHubIcon,
  IconFrame,
  Table,
  TerminalIcon,
} from '@pluralsh/design-system'
import { ComponentProps, memo, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import styled from 'styled-components'
import isEmpty from 'lodash/isEmpty'

import { Cluster, Provider, Source } from '../../generated/graphql'
import CopyButton from '../utils/CopyButton'
import { ProviderIcon } from '../utils/ProviderIcon'
import { ensureURLValidity } from '../../utils/url'

import ClusterHealth from './ClusterHealth'

type ClusterListElement = {
    name: string
    provider: Provider
    source?: Source | null
    pingedAt?: Date | null
    gitUrl?: string | null
    consoleUrl?: string | null
    delivered: boolean
    owner?: {
      name?: string
      email?: string
      avatar?: string | null
      hasShell?: boolean | null
    }
    mock?: boolean
  }

const sourceDisplayNames = {
  [Source.Default]: 'CLI',
  [Source.Shell]: 'Cloud shell',
  [Source.Demo]: 'Demo',
}

const CellWrap = styled.div(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing.small,
}))

const ActionsWrap = styled(CellWrap)({ alignSelf: 'end' })

const CellCaption = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
}))

const columnHelper = createColumnHelper<ClusterListElement>()

export const ColCluster = columnHelper.accessor(row => row.name, {
  id: 'cluster',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: {
        name, provider, source, mock,
      },
    },
  }) => (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={mock ? <ClusterIcon color="icon-warning" /> : (
          <ProviderIcon
            provider={provider}
            width={16}
          />
        )}
      />
      <div>
        <div>{name}</div>
        <CellCaption>{mock ? 'Space' : sourceDisplayNames[source || '']}</CellCaption>
      </div>
    </CellWrap>
  ),
  header: 'Cluster',
})

export const ColHealth = columnHelper.accessor(row => row.pingedAt, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { pingedAt, mock } } }) => (mock
    ? <Chip severity="success">Enchanted</Chip>
    : <ClusterHealth pingedAt={pingedAt} />),
  header: 'Health',
})

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

export const ColOwner = columnHelper.accessor(row => row.owner?.name, {
  id: 'owner',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { owner, mock } } }) => (
    <CellWrap>
      <AppIcon
        name={owner?.name}
        url={owner?.avatar || undefined}
        size="xxsmall"
        spacing={mock ? 'none' : undefined}
      />
      <div>
        <div>{owner?.name}</div>
        <CellCaption>{owner?.email}</CellCaption>
      </div>
    </CellWrap>
  ),
  header: 'Owner',
})

export const ColUpgrades = columnHelper.accessor(row => row.delivered, {
  id: 'upgrades',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { delivered, mock } } }) => {
    if (mock) return <Chip severity="warning">Magical</Chip>

    return (
      <Chip
        severity={delivered ? 'success' : 'warning'}
        hue="lighter"
      >
        {delivered ? 'Delivered' : 'Pending'}
      </Chip>
    )
  },
  header: 'Upgrades',
})

export const ColActions = columnHelper.accessor(row => row.consoleUrl, {
  id: 'actions',
  enableGlobalFilter: false,
  enableSorting: false,
  cell: ({ row: { original: { consoleUrl, mock } } }) => (
    <ActionsWrap>
      {mock && (
        <Button
          secondary
          small
          as="a"
          href="https://www.plural.sh/demo-login"
          target="_blank"
          rel="noopener noreferrer"
        >
          View live demo console
        </Button>
      )}
      {consoleUrl && (
        <Button
          secondary
          small
          as="a"
          href={consoleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Launch Console
        </Button>
      )}
      <IconFrame
        clickable={!mock}
        size="medium"
        icon={<CaretRightIcon />}
        onClick={() => null} // TODO: Navigate to details page.
        textValue=""
        type="tertiary"
      />
    </ActionsWrap>
  ),
  header: '',
})

const emptyTableData: ClusterListElement[] = [{
  name: 'Not a cluster, yet...',
  delivered: false,
  provider: Provider.Custom,
  owner: {
    name: 'Singular',
    email: 'singular@plural.sh',
    avatar: '/singular.svg',
  },
  mock: true,
}]

type ClustersListProps = Omit<ComponentProps<typeof Table>, 'data'> & {
    clusters?: (Cluster | null)[]
    columns: any[]
  }

export const ClustersList = memo(({ clusters, columns, ...props }: ClustersListProps) => {
  const tableData: ClusterListElement[] = useMemo(() => (clusters || [])
    .filter((cluster): cluster is Cluster => !!cluster)
    .map(cluster => {
      const acked = cluster.queue?.acked
      const deliveryStatuses = cluster.queue?.upgrades?.edges?.map(edge => {
        const id = edge?.node?.id

        return (!!id && !!acked && id <= acked)
      })
      const delivered = !!deliveryStatuses && !deliveryStatuses.includes(false)

      return {
        name: cluster.name,
        provider: cluster.provider,
        source: cluster.source,
        gitUrl: cluster.gitUrl,
        consoleUrl: ensureURLValidity(cluster.consoleUrl),
        pingedAt: cluster.pingedAt,
        delivered,
        owner: {
          name: cluster.owner?.name,
          email: cluster.owner?.email,
          avatar: cluster.owner?.avatar,
          hasShell: cluster.owner?.hasShell,
        },
      }
    }),
  [clusters])

  return (
    <Table
      data={isEmpty(clusters) ? tableData : emptyTableData}
      columns={columns}
      virtualizeRows
      {...props}
    />
  )
})

