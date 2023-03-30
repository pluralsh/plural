import { CopyIcon, IconFrame, Table } from '@pluralsh/design-system'
import { ComponentProps, memo, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'

import { Cluster, Maybe, Source } from '../../generated/graphql'

type ClusterListElement = {
    name: string
    source?: Source
    gitUrl?: string
    owner?: {
      name?: string
      email?: string
    }
  }

const columnHelper = createColumnHelper<ClusterListElement>()

export const ColCluster = columnHelper.accessor(row => row, {
  id: 'cluster',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => {
    const cluster = props.getValue()

    return (
      <>
        <div>{cluster?.name}</div>
        <div>{cluster?.source}</div>
      </>
    )
  },
  header: 'Cluster',
})

export const ColHealth = columnHelper.accessor(row => row, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original }, ...props }) => original.name,
  header: 'Health',
})

export const ColGit = columnHelper.accessor(row => row.gitUrl, {
  id: 'git',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => {
    const gitUrl = props.getValue()

    return (
      <IconFrame
        clickable
        icon={<CopyIcon />}
        textValue={gitUrl}
        tooltip
        type="floating"
      />
    )
  },
  header: 'Git',
})

export const ColCloudshell = columnHelper.accessor(row => row, {
  id: 'cloudshell',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original }, ...props }) => original.name,
  header: 'Cloudshell',
})

export const ColOwner = columnHelper.accessor(row => row.owner, {
  id: 'owner',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: props => {
    const owner = props.getValue()

    return (
      <>
        <div>{owner?.name}</div>
        <div>{owner?.email}</div>
      </>
    )
  },
  header: 'Owner',
})

export const ColUpgrades = columnHelper.accessor(row => row, {
  id: 'upgrades',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original }, ...props }) => original.name,
  header: 'Upgrades',
})

export const ColActions = columnHelper.accessor(row => row, {
  id: 'actions',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original }, ...props }) => original.name,
  header: '',
})

type ClustersListProps = Omit<ComponentProps<typeof Table>, 'data'> & {
    clusters?: Maybe<Cluster>[]
    columns: any[]
  }

export const ClustersList = memo(({ clusters, columns, ...props }: ClustersListProps) => {
  const tableData: ClusterListElement[] = useMemo(() => (clusters || [])
    .filter((cluster): cluster is Cluster => !!cluster)
    .map(cluster => ({
      name: cluster.name,
      source: cluster.source,
      gitUrl: cluster.gitUrl,
      owner: {
        name: cluster.owner?.name,
        email: cluster.owner?.email,
      },
    })),
  [clusters])

  console.log(tableData)

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

