import { useQuery } from '@apollo/client'
import { Flex } from 'honorable'
import LoadingSpinner from 'pluralsh-design-system/dist/components/LoadingSpinner'
import { ReactElement, useEffect, useState } from 'react'

import QueueContext from '../../contexts/QueueContext'
import {
  ResponsiveLayoutContentContainer, ResponsiveLayoutSidecarContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'

import { ClustersContent, Upgrade } from './ClustersContent'
import { ClustersSidecar } from './ClustersSidecar'
import { ClustersSidenav } from './ClustersSidenav'

import { QUEUES, UPGRADE_QUEUE_SUB } from './queries'

export interface Queue {
  acked: string;
  domain: string;
  git: string;
  id: string;
  name: string;
  pingedAt: string;
  provider: string;
  upgrades: Upgrade[];
}

export function Clusters(): ReactElement | null {
  const [queue, setQueue] = useState({} as Queue)
  const { data, subscribeToMore } = useQuery(QUEUES, { fetchPolicy: 'cache-and-network' })

  useEffect(() => subscribeToMore({
    document: UPGRADE_QUEUE_SUB,
    updateQuery: ({ upgradeQueues, ...prev }, {
      subscriptionData: {
        data: {
          upgradeQueueDelta: {
            delta,
            payload,
          },
        },
      },
    }) => (delta === 'CREATE' ? { ...prev, upgradeQueues: [payload, ...upgradeQueues] } : prev),
  }), [subscribeToMore])

  useEffect(() => (data ? setQueue(data?.upgradeQueues[0]) : data), [data])

  if (!data || !queue) {
    return <LoadingSpinner />
  }

  return (
    <QueueContext.Provider value={queue}>
      <Flex
        flexGrow={1}
        height={0}
        overflowX="hidden"
        paddingLeft="medium"
        paddingRight="large"
        paddingTop="xxxlarge"
        paddingBottom="medium"
      >
        <ResponsiveLayoutSidenavContainer>
          <ClustersSidenav />
        </ResponsiveLayoutSidenavContainer>
        <ResponsiveLayoutSpacer />
        <ResponsiveLayoutContentContainer>
          <ClustersContent />
        </ResponsiveLayoutContentContainer>
        <ResponsiveLayoutSidecarContainer>
          <ClustersSidecar />
        </ResponsiveLayoutSidecarContainer>
        <ResponsiveLayoutSpacer />
      </Flex>
    </QueueContext.Provider>
  )
}

