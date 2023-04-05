import { Table } from '@pluralsh/design-system'
import {
  ComponentProps,
  memo,
  useContext,
  useMemo,
} from 'react'
import isEmpty from 'lodash/isEmpty'

import { Cluster, Provider } from '../../../../generated/graphql'
import { ensureURLValidity } from '../../../../utils/url'
import ClustersContext from '../../../../contexts/ClustersContext'

import { ClusterListElement } from './types'

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
      data={!isEmpty(clusters) ? tableData : emptyTableData}
      columns={columns}
      virtualizeRows
      {...props}
    />
  )
})

