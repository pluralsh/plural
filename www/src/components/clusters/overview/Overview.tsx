import { Flex } from 'honorable'
import { ReactElement, useContext, useMemo } from 'react'
import { isEmpty } from 'lodash'

import ClustersContext from '../ClustersContext'

import OverviewHelpSection from './OverviewHelpSection'
import Upgrades from './upgrades/Upgrades'
import { ColCluster } from './clusters/columns/ColCluster'
import { ColHealth } from './clusters/columns/ColHealth'
import { ColGit } from './clusters/columns/ColGit'
import { ColCloudshell } from './clusters/columns/ColCloudshell'
import { ColOwner } from './clusters/columns/ColOwner'
import { ColUpgrades } from './clusters/columns/ColUpgrades'
import { ColActions } from './clusters/columns/ColActions'
import { Clusters } from './clusters/Clusters'

export function Overview(): ReactElement | null {
  const { clusters } = useContext(ClustersContext)

  const columns = useMemo(() => [ColCluster, ColHealth, ColGit, ColCloudshell, ColOwner, ColUpgrades, ColActions], [])

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
      <Clusters columns={columns} />
      <Upgrades />
      {isEmpty(clusters) && <OverviewHelpSection />}
    </Flex>
  )
}
