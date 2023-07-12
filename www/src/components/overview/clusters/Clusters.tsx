import { Flex } from 'honorable'
import { isEmpty } from 'lodash'
import { ReactElement, useContext, useMemo } from 'react'

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
    <Flex
      direction="column"
      gap="medium"
      grow={1}
    >
      <ClusterList
        columns={columns}
        maxHeight="600px"
      />
      <Upgrades />
      {isEmpty(clusters) && <ClustersHelpSection />}
    </Flex>
  )
}
