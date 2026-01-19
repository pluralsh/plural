import { Table, useSetBreadcrumbs } from '@pluralsh/design-system'
import { type Row } from '@tanstack/react-table'

import { useNavigate, useOutletContext } from 'react-router-dom'
import { CLUSTERS_OVERVIEW_BREADCRUMBS, OverviewContextType } from '../Clusters'
import {
  ColActions,
  ColCluster,
  ColHealth,
  ColOwner,
} from '../SelfHostedTableCols'
import { ClusterListElement } from '../clusterListUtils'

const breadcrumbs = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'self-hosted', url: '/overview/clusters/self-hosted' },
]

export function SelfHostedClusters() {
  useSetBreadcrumbs(breadcrumbs)
  const navigate = useNavigate()
  const { selfHostedClusters } = useOutletContext<OverviewContextType>()
  return (
    <Table
      data={selfHostedClusters}
      columns={columns}
      emptyStateProps={{ message: 'No self-hosted instances found' }}
      onRowClick={(_, { original }: Row<ClusterListElement>) =>
        original.accessible && navigate(`/clusters/${original.id}`)
      }
      css={{ maxHeight: 600 }}
    />
  )
}

const columns = [ColCluster, ColHealth, ColOwner, ColActions]
