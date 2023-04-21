import { useSetBreadcrumbs } from '@pluralsh/design-system'

import { CLUSTERS_ROOT_CRUMB } from '../Overview'

const breadcrumbs = [
  CLUSTERS_ROOT_CRUMB,
  { label: 'installed apps', url: '/overview/apps' },
]

export function Apps(): null {
  useSetBreadcrumbs(breadcrumbs)

  return null
}
