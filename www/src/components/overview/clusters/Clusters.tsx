import { isEmpty } from 'lodash'
import { ReactElement, useContext } from 'react'

import { Flex } from '@pluralsh/design-system'

import { Outlet } from 'react-router-dom'

import ConsoleInstancesContext from 'contexts/ConsoleInstancesContext'

import ClustersContext from '../../../contexts/ClustersContext'

import OverviewHeader from '../OverviewHeader'

import ClusterListEmptyState from './ClusterListEmptyState'
import ClustersHelpSection from './ClustersHelpSection'

export const CLUSTERS_ROOT_CRUMB = {
  label: 'clusters',
  url: '/overview/clusters',
}

export const CLUSTERS_OVERVIEW_BREADCRUMBS = [
  { label: 'overview', url: '/overview' },
  CLUSTERS_ROOT_CRUMB,
]

export function Clusters(): ReactElement | null {
  const { clusters } = useContext(ClustersContext)
  const { instances } = useContext(ConsoleInstancesContext)
  const showEmpty = isEmpty(clusters) && isEmpty(instances)

  return (
    <Flex
      direction="column"
      gap={showEmpty ? 'large' : 'medium'}
      minWidth="fit-content"
      overflow="auto"
    >
      {showEmpty ? (
        <>
          <ClusterListEmptyState />
          <ClustersHelpSection />
        </>
      ) : (
        <>
          <OverviewHeader />
          <Outlet />
        </>
      )}
    </Flex>
  )
}
