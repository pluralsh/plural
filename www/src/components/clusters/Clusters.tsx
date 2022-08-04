import { useQuery } from '@apollo/client'
import { EmptyState } from 'components/utils/EmptyState'
import { Box } from 'grommet'
import {
  A, Br, Flex, Span,
} from 'honorable'
import { Button } from 'pluralsh-design-system'
import LoadingSpinner from 'pluralsh-design-system/dist/components/LoadingSpinner'
import { ReactElement, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
  const { data, loading, subscribeToMore } = useQuery(QUEUES, { fetchPolicy: 'cache-and-network' })

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

  if (loading) return <LoadingSpinner />

  if (!data || !queue) {
    return (
      <Box margin={{ top: '152px' }}>
        <EmptyState
          message="Looks like you don't have any clusters registered yet."
          description={(
            <Span>
              Clusters are registered here once you've installed and deployer Plural
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
          )}
        >
          <Button
            as={Link}
            to="/marketplace"
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

