import { useSetBreadcrumbs } from '@pluralsh/design-system'

import { ClusterList } from '../ClusterList'
import { CLUSTERS_OVERVIEW_BREADCRUMBS } from '../Clusters'
import {
  ColActions,
  ColCluster,
  ColHealth,
  ColOwner,
} from '../SelfHostedTableCols'

const breadcrumbs = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'self-hosted', url: '/overview/clusters/self-hosted' },
]

export function SelfHostedClusters() {
  useSetBreadcrumbs(breadcrumbs)

  return (
    <ClusterList
      columns={columns}
      css={{
        maxHeight: 600,
      }}
    />
  )
}

const columns = [ColCluster, ColHealth, ColOwner, ColActions]
