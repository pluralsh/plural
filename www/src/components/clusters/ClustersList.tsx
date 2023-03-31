import {
  AppIcon,
  ArrowRightIcon,
  Button,
  CaretRightIcon,
  IconFrame,
  Table,
} from '@pluralsh/design-system'
import { ComponentProps, memo, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import styled from 'styled-components'

import { Cluster, Provider, Source } from '../../generated/graphql'
import CopyButton from '../utils/CopyButton'
import { ProviderIcon } from '../utils/ProviderIcon'
import { ensureURLValidity } from '../../utils/url'

type ClusterListElement = {
    name: string
    provider: Provider
    source?: Source | null
    gitUrl?: string | null
    consoleUrl?: string | null
    owner?: {
      name?: string
      email?: string
      avatar?: string | null
    }
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

const CellCaption = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
}))

const columnHelper = createColumnHelper<ClusterListElement>()

export const ColCluster = columnHelper.accessor(row => row, {
  id: 'cluster',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => {
    const cluster = props.getValue()

    return (
      <CellWrap>
        <AppIcon
          size="xxsmall"
          icon={(
            <ProviderIcon
              provider={cluster.provider}
              width={16}
            />
          )}
        />
        <div>
          <div>{cluster?.name}</div>
          <CellCaption>{sourceDisplayNames[cluster?.source || '']}</CellCaption>
        </div>
      </CellWrap>
    )
  },
  header: 'Cluster',
})

export const ColHealth = columnHelper.accessor(row => row.name, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => props.getValue(),
  header: 'Health',
})

export const ColGit = columnHelper.accessor(row => row.gitUrl, {
  id: 'git',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => <CopyButton text={props.getValue() || ''} />,
  header: 'Git',
})

export const ColCloudshell = columnHelper.accessor(row => row.name, {
  id: 'cloudshell',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => props.getValue(),
  header: 'Cloudshell',
})

export const ColOwner = columnHelper.accessor(row => row.owner, {
  id: 'owner',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => {
    const owner = props.getValue()

    return (
      <CellWrap>
        <AppIcon
          name={owner?.name}
          url={owner?.avatar || undefined}
          size="xxsmall"
        />
        <div>
          <div>{owner?.name}</div>
          <CellCaption>{owner?.email}</CellCaption>
        </div>
      </CellWrap>
    )
  },
  header: 'Owner',
})

export const ColUpgrades = columnHelper.accessor(row => row.name, {
  id: 'upgrades',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => props.getValue(),
  header: 'Upgrades',
})

export const ColActions = columnHelper.accessor(row => row.consoleUrl, {
  id: 'actions',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => {
    const consoleUrl = props.getValue()

    return (
      <CellWrap>
        {consoleUrl && (
          <Button
            secondary
            small
            as="a"
            href={ensureURLValidity(consoleUrl)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Launch Console
          </Button>
        )}
        <IconFrame
          clickable
          size="medium"
          icon={<CaretRightIcon />}
          onClick={() => null} // TODO: Navigate to details page.
          textValue="Forward"
          type="tertiary"
        />
      </CellWrap>
    )
  },
  header: '',
})

type ClustersListProps = Omit<ComponentProps<typeof Table>, 'data'> & {
    clusters?: (Cluster | null)[]
    columns: any[]
  }

export const ClustersList = memo(({ clusters, columns, ...props }: ClustersListProps) => {
  const tableData: ClusterListElement[] = useMemo(() => (clusters || [])
    .filter((cluster): cluster is Cluster => !!cluster)
    .map(cluster => ({
      name: cluster.name,
      provider: cluster.provider,
      source: cluster.source,
      gitUrl: cluster.gitUrl,
      consoleUrl: cluster.consoleUrl,
      owner: {
        name: cluster.owner?.name,
        email: cluster.owner?.email,
        avatar: cluster.owner?.avatar,
      },
    })),
  [clusters])

  if (!clusters || clusters.length === 0) {
    return <>No clusters available.</>
  }

  return (
    <Table
      data={tableData}
      columns={columns}
      virtualizeRows
      {...props}
    />
  )
})

