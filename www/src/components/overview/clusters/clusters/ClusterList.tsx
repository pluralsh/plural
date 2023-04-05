import { Table } from '@pluralsh/design-system'
import {
  ComponentProps,
  memo,
  useContext,
  useMemo,
} from 'react'

import { Cluster } from '../../../../generated/graphql'
import { ensureURLValidity } from '../../../../utils/url'
import ClustersContext from '../../../../contexts/ClustersContext'

import { ClusterListElement } from './types'

type ClustersListProps = Omit<ComponentProps<typeof Table>, 'data'> & {
    clusters?: (Cluster | null)[]
    columns: any[]
  }

export const ClusterList = memo(({ columns, ...props }: ClustersListProps) => {
  const { clusters } = useContext(ClustersContext)

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
        id: cluster.id,
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

  // TODO: Handle empty list.

  return (
    <Table
      data={tableData}
      columns={columns}
      virtualizeRows
      {...props}
    />
  )
})

