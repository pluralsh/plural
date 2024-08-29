import { isEmpty } from 'lodash'
import { ReactElement, useContext } from 'react'

import { Flex } from '@pluralsh/design-system'

import { Outlet } from 'react-router-dom'

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

  return (
    <Flex
      direction="column"
      gap={isEmpty(clusters) ? 'large' : 'medium'}
      minWidth="fit-content"
      overflow="auto"
    >
      {isEmpty(clusters) ? (
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
