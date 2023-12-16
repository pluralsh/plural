import { isEmpty } from 'lodash'
import { ReactElement, useContext, useMemo } from 'react'
import { useTheme } from 'styled-components'
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

import Upgrades from './Upgrades'

export function Clusters(): ReactElement | null {
  const theme = useTheme()
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

  // useEffect(() => subscribeToMore<QueueSubscription>({
  //   document: UPGRADE_QUEUE_SUB,
  //   updateQuery: (prev,
  //     {
  //       subscriptionData: {
  //         data: {
  //           upgradeQueueDelta: { delta, payload },
  //         },
  //       },
  //     }) => (delta === 'CREATE'
  //     ? { ...prev, upgradeQueues: [payload, ...prev.upgradeQueues] }
  //     : prev),
  // }),
  // [subscribeToMore])

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.medium,
        flexGrow: 1,
      }}
    >
      <ClusterList
        columns={columns}
        css={{
          maxHeight: 600,
        }}
      />
      <Upgrades />
      {isEmpty(clusters) && <ClustersHelpSection />}
    </div>
  )
}
