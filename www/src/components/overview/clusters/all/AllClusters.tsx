import { Table, useSetBreadcrumbs } from '@pluralsh/design-system'
import { type Row } from '@tanstack/react-table'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { CLUSTERS_OVERVIEW_BREADCRUMBS, OverviewContextType } from '../Clusters'
import {
  allClustersCols,
  CombinedClusterT,
  CombinedClusterType,
} from './AllClustersTableCols'
import { PLURAL_CLOUD_INSTANCES_PATH_ABS } from '../plural-cloud/PluralCloudInstances'

const ALL_CLUSTERS_BREADCRUMBS = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'all', url: '/overview/clusters/all' },
]

export function AllClusters() {
  useSetBreadcrumbs(ALL_CLUSTERS_BREADCRUMBS)
  const navigate = useNavigate()
  const { combinedClusterList } = useOutletContext<OverviewContextType>()
  return (
    <Table
      data={combinedClusterList}
      columns={allClustersCols}
      emptyStateProps={{ message: 'No clusters found' }}
      onRowClick={(_, { original }: Row<CombinedClusterT>) => {
        if (
          original.type === CombinedClusterType.SelfHosted &&
          original.accessible
        )
          navigate(`/clusters/${original.id}`)
        else if (original.type === CombinedClusterType.PluralCloud)
          navigate(PLURAL_CLOUD_INSTANCES_PATH_ABS + `/${original.id}`)
      }}
    />
  )
}
