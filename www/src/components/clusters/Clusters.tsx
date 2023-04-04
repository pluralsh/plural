import { useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import { ReactElement, useMemo } from 'react'

import { isEmpty } from 'lodash'

import { Cluster, RootQueryType, RootQueryTypeClustersArgs } from '../../generated/graphql'
import LoadingIndicator from '../utils/LoadingIndicator'

import ClustersHelpSection from './ClustersHelpSection'

import {
  ClustersList,
  ColActions,
  ColCloudshell,
  ColCluster,
  ColGit,
  ColHealth,
  ColOwner,
  ColUpgrades,
} from './ClustersList'

import { CLUSTERS } from './queries'
import ClusterUpgradesList from './ClusterUpgradesList'

export function Clusters(): ReactElement | null {
  const { data, loading, error } = useQuery<Pick<RootQueryType, 'clusters'>, RootQueryTypeClustersArgs>(CLUSTERS,
    { pollInterval: 60_000 })

  const clusters: Cluster[] = useMemo(() => data?.clusters?.edges?.map(edge => edge?.node).filter((node): node is Cluster => !!node) || [], [data])
  const columns = useMemo(() => [ColCluster, ColHealth, ColGit, ColCloudshell, ColOwner, ColUpgrades, ColActions], [])

  if (error) return <p>{error.message}</p>
  if (!data && loading) return <LoadingIndicator />

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

  console.log(clusters)

  return (
    <Flex
      direction="column"
      padding="large"
      gap="large"
      flexGrow={1}
      overflow="auto"
    >
      <ClustersList
        clusters={clusters}
        columns={columns}
      />
      <ClusterUpgradesList clusters={clusters} />
      {isEmpty(clusters) && <ClustersHelpSection />}
    </Flex>
  )
}
