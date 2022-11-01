import { useQuery } from '@apollo/client'
import { Box } from 'grommet'
import {
  A,
  Br,
  Flex,
  Span,
} from 'honorable'
import { Button, EmptyState, LoopingLogo } from 'pluralsh-design-system'
import { ReactElement, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import QueueContext from '../../contexts/QueueContext'
import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'

import { ClustersContent, Upgrade } from './ClustersContent'
import { ClustersSidecar } from './ClustersSidecar'
import { ClustersSidenav } from './ClustersSidenav'
import { QUEUES, UPGRADE_QUEUE_SUB } from './queries'

export interface QueueList {
  upgradeQueues: Array<Queue>;
}

export interface QueueSubscription {
  upgradeQueueDelta: {
    delta: 'CREATE',
    payload: Queue;
  }
}

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
  const [queue, setQueue] = useState<Queue | undefined>({} as Queue)
  const {
    data,
    subscribeToMore,
  } = useQuery<QueueList>(QUEUES, { fetchPolicy: 'cache-and-network' })

  useEffect(() => subscribeToMore<QueueSubscription>({
    document: UPGRADE_QUEUE_SUB,
    updateQuery: (prev, {
      subscriptionData: {
        data: {
          upgradeQueueDelta: {
            delta,
            payload,
          },
        },
      },
    }) => (delta === 'CREATE' ? { ...prev, upgradeQueues: [payload, ...prev.upgradeQueues] } : prev),
  }), [subscribeToMore])

  useEffect(() => (data ? setQueue(data?.upgradeQueues[0]) : data), [data])

  if (!data) {
    return (
      <Flex
        align="center"
        justify="center"
        flexGrow={1}
      >
        <LoopingLogo />
      </Flex>
    )
  }

  if (!data || !queue) {
    return (
      <Box margin={{ top: '152px' }}>
        <EmptyState
          message="Looks like you don't have any clusters registered yet."
        >
          <Span>
            Clusters are registered here once you've installed and deployed Plural
            <Br />Console. If you need support installing it, read our&nbsp;
            <A
              inline
              href="https://docs.plural.sh/getting-started/getting-started"
              target="_blank"
              rel="noopener noreferrer"
            >
              quickstart guide
            </A>.
          </Span>
          <Button
            as={Link}
            to="/repository/a051a0bf-61b5-4ab5-813d-2c541c83a979"
            marginTop="medium"
          >
            Install Plural Console
          </Button>
        </EmptyState>
      </Box>
    )
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
          <ClustersSidenav
            onQueueChange={setQueue}
            queues={data.upgradeQueues}
          />
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
