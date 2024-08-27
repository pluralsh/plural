import { ReactElement, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { Flex } from 'honorable'

import { useSetBreadcrumbs } from '@pluralsh/design-system'

import ClustersContext from 'contexts/ClustersContext'

import { isEmpty } from 'lodash'

import OverviewHeader from './OverviewHeader'

export const CLUSTERS_ROOT_CRUMB = { label: 'clusters', url: '/overview' }
const breadcrumbs = [
  CLUSTERS_ROOT_CRUMB,
  { label: 'overview', url: '/overview/clusters' },
]

export function Overview(): ReactElement {
  const { clusters } = useContext(ClustersContext)

  useSetBreadcrumbs(breadcrumbs)

  return (
    <Flex
      direction="column"
      grow={1}
      padding="large"
      overflowY="auto"
    >
      {!isEmpty(clusters) && <OverviewHeader />}
      <Outlet />
    </Flex>
  )
}
