import { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import { Flex } from 'honorable'

import { useSetBreadcrumbs } from '@pluralsh/design-system'

import OverviewHeader from './OverviewHeader'

export const CLUSTERS_ROOT_CRUMB = { label: 'clusters', url: '/overview' }
const breadcrumbs = [
  CLUSTERS_ROOT_CRUMB,
  { label: 'overview', url: '/overview/clusters' },
]

export function Overview(): ReactElement {
  useSetBreadcrumbs(breadcrumbs)

  return (
    <Flex
      direction="column"
      grow={1}
      padding="large"
    >
      <OverviewHeader />
      <Outlet />
    </Flex>
  )
}
