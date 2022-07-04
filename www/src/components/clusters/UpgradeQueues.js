import { useContext, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { Box, Text } from 'grommet'
import { Github } from 'grommet-icons'
import { Update } from 'forge-core'

import { Provider } from '../repos/misc'
import { BreadcrumbsContext } from '../Breadcrumbs'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { QueueHealth } from './QueueHealth'
import { QUEUES, UPGRADE_QUEUE_SUB } from './queries'

function Queue({ q }) {
  const navigate = useNavigate()

  return (
    <Box
      flex={false}
      pad="small"
      onClick={() => navigate(`/upgrades/${q.id}`)}
      hoverIndicator="fill-one"
      border={{ side: 'bottom' }}
      direction="row"
      gap="small"
      align="center"
      fill="horizontal"
    >
      <Provider
        provider={q.provider}
        width={30}
      />
      <Box
        fill="horizontal"
        gap="xsmall"
      >
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            size="small"
            weight={500}
          >{q.name || 'default'}
          </Text>
          <Text
            size="small"
            color="dark-3"
          >{q.domain}
          </Text>
        </Box>
        {q.git && (
          <Box
            direction="row"
            gap="xsmall"
            align="center"
          >
            <Github size="14px" />
            <Text
              size="small"
              color="dark-3"
            >{q.git}
            </Text>
          </Box>
        )}
      </Box>
      <QueueHealth queue={q} />
    </Box>
  )
}

export function UpgradeQueues() {
  const { data, subscribeToMore } = useQuery(QUEUES, { fetchPolicy: 'cache-and-network' })

  useEffect(() => subscribeToMore({
    document: UPGRADE_QUEUE_SUB,
    updateQuery: ({ upgradeQueues, ...prev }, { subscriptionData: { data: { upgradeQueueDelta: { delta, payload } } } }) => delta === 'CREATE' ? { ...prev, upgradeQueues: [payload, ...upgradeQueues] } : prev,
  }), [subscribeToMore])

  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{ url: '/upgrades', text: 'upgrades' }])
  }, [setBreadcrumbs])

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  return (
    <Box
      fill
      background="background"
    >
      <Box
        flex={false}
        pad="small"
        direction="row"
        align="center"
        gap="xsmall"
        border={{ side: 'bottom' }}
      >
        <Update size="15px" />
        <Text
          size="small"
          weight={500}
        >Upgrade Queues
        </Text>
      </Box>
      <Box fill>
        {data.upgradeQueues.map(q => (
          <Queue
            key={q.id}
            q={q}
          />
        ))}
      </Box>
    </Box>
  )

}
