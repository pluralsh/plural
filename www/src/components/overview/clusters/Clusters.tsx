import { Flex } from 'honorable'
import { ReactElement, useContext, useMemo } from 'react'
import { isEmpty } from 'lodash'

import { useNavigate } from 'react-router-dom'

import ClustersContext from '../../../contexts/ClustersContext'

import Upgrades from './upgrades/Upgrades'
import ClustersHelpSection from './ClustersHelpSection'
import { ClusterList } from './clusters/ClusterList'
import {
  ColActions,
  ColCloudShell,
  ColCluster,
  ColGit,
  ColHealth,
  ColOwner,
  ColUpgrades,
} from './clusters/columns'

export function Clusters(): ReactElement | null {
  const { clusters } = useContext(ClustersContext)
  const navigate = useNavigate()

  const columns = useMemo(() => [ColCluster, ColHealth, ColGit, ColCloudShell, ColOwner, ColUpgrades, ColActions(navigate)], [navigate])

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
      gap="large"
      flexGrow={1}
      overflow="auto"
    >
      <ClusterList columns={columns} />
      <Upgrades />
      {isEmpty(clusters) && <ClustersHelpSection />}
    </Flex>
  )
}
