import { Table } from '@pluralsh/design-system'
import { ComponentProps, memo, useContext, useMemo } from 'react'

import ClustersContext from '../../../contexts/ClustersContext'
import CurrentUserContext, {
  CurrentUser,
} from '../../../contexts/CurrentUserContext'
import { Cluster } from '../../../generated/graphql'
import { ensureURLValidity } from '../../../utils/url'

import { ClusterListElement } from './types'
import { useNavigate } from 'react-router-dom'

type ClustersListProps = Omit<ComponentProps<typeof Table>, 'data'> & {
  clusters?: (Cluster | null)[]
  columns: any[]
}

function fromClusterList(
  clusters: Array<Cluster>,
  user: CurrentUser
): Array<ClusterListElement> {
  return clusters
    .filter((cluster): cluster is Cluster => !!cluster)
    .map((cluster) => {
      const acked = cluster.queue?.acked
      const deliveryStatuses = cluster.queue?.upgrades?.edges?.map((edge) => {
        const id = edge?.node?.id

        return !!id && !!acked && id <= acked
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
        accessible:
          cluster.owner?.id === user.id || cluster.owner?.serviceAccount,
        delivered,
        hasDependency: !!cluster.dependency,
        owner: {
          id: cluster.owner?.id,
          name: cluster.owner?.name,
          email: cluster.owner?.email,
          avatar: cluster.owner?.avatar,
          hasShell: cluster.owner?.hasShell,
        },
        raw: cluster,
      }
    })
}

export const ClusterList = memo(({ columns, ...props }: ClustersListProps) => {
  const navigate = useNavigate()
  const me = useContext(CurrentUserContext)
  const { clusters } = useContext(ClustersContext)

  const tableData: ClusterListElement[] = useMemo(
    () => [...fromClusterList(clusters, me)],
    [clusters, me]
  )

  return (
    <Table
      data={tableData}
      columns={columns}
      emptyStateProps={{ message: 'No self-hosted clusters found' }}
      onRowClick={(_, { original }) =>
        original?.id &&
        original.accessible &&
        navigate(`/clusters/${original?.id}`)
      }
      {...props}
    />
  )
})
