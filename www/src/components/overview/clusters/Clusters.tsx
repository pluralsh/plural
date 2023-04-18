import { Flex } from 'honorable'
import { ReactElement, useContext, useMemo } from 'react'
import { isEmpty } from 'lodash'

import ClustersContext from '../../../contexts/ClustersContext'

import Upgrades from './Upgrades'
import ClustersHelpSection from './ClustersHelpSection'
import { ClusterList } from './ClusterList'
import {
  ColActions,
  ColCloudShell,
  ColCluster,
  ColGit,
  ColHealth,
  ColOwner,
  ColUpgrades,
} from './columns'

export function Clusters(): ReactElement | null {
  const { clusters } = useContext(ClustersContext)

  const columns = useMemo(() => [
    ColCluster,
    ColHealth,
    ColGit,
    ColCloudShell,
    ColOwner,
    ColUpgrades,
    ColActions,
  ],
  [])

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
      <ClusterList columns={columns} />
      <Upgrades />
      {isEmpty(clusters) && <ClustersHelpSection />}
    </Flex>
  )
}
