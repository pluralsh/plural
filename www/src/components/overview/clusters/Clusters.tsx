import { isEmpty } from 'lodash'
import { ReactElement, useContext, useMemo } from 'react'
import { useTheme } from 'styled-components'

import { useSetBreadcrumbs } from '@pluralsh/design-system'

import ClustersContext from '../../../contexts/ClustersContext'

import { ClusterList } from './ClusterList'
import ClustersHelpSection from './ClustersHelpSection'
import {
  ColActions,
  ColCloudShell,
  ColCluster,
  ColGit,
  ColHealth,
  ColOwner,
  ColPromotions,
  ColUpgrades,
} from './columns'

export const CLUSTERS_ROOT_CRUMB = { label: 'clusters', url: '/overview' }

const breadcrumbs = [
  { label: 'overview', url: '/overview/clusters' },
  CLUSTERS_ROOT_CRUMB,
]

export function Clusters(): ReactElement | null {
  const theme = useTheme()

  useSetBreadcrumbs(breadcrumbs)
  const { clusters } = useContext(ClustersContext)

  const columns = useMemo(
    () => [
      ColCluster,
      ColHealth,
      ColGit,
      ColCloudShell,
      ColOwner,
      ColUpgrades,
      ColPromotions,
      ColActions,
    ],
    []
  )

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 'fit-content',
        overflow: 'auto',
        gap: theme.spacing.large,
      }}
    >
      <ClusterList
        columns={columns}
        css={{
          maxHeight: 600,
        }}
      />
      {isEmpty(clusters) && <ClustersHelpSection />}
    </div>
  )
}
