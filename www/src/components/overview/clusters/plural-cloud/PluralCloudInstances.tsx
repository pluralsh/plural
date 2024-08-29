import { useSetBreadcrumbs } from '@pluralsh/design-system'

import { CLUSTERS_OVERVIEW_BREADCRUMBS } from '../Clusters'

const breadcrumbs = [
  ...CLUSTERS_OVERVIEW_BREADCRUMBS,
  { label: 'plural-cloud', url: '/overview/clusters/plural-cloud' },
]

export function PluralCloudInstances() {
  useSetBreadcrumbs(breadcrumbs)

  return <div>PluralCloudInstances</div>
}
