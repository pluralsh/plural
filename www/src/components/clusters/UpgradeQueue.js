import { useContext, useEffect, useState } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import { Reload as Refresh } from 'forge-core'
import { Box, Text } from 'grommet'
import moment from 'moment'
import { BeatLoader } from 'react-spinners'
import { Github } from 'grommet-icons'
import { useParams } from 'react-router-dom'

import { appendConnection, extendConnection } from '../../utils/graphql'
import { RepoIcon } from '../repos/Repositories'

import { BreadcrumbsContext } from '../Breadcrumbs'
import { Attributes } from '../incidents/utils'
import { Attribute, Container } from '../integrations/Webhook'
import { Provider } from '../repos/misc'

import { StandardScroller } from '../utils/SmoothScroller'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { QueueHealth } from './QueueHealth'

import { QUEUE, UPGRADE_QUEUE_SUB, UPGRADE_SUB } from './queries'

function DeliveryProgress({ delivered }) {
  return (
    <Box
      flex={false}
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      background={delivered ? 'success' : 'progress'}
      direction="row"
      gap="small"
      round="xsmall"
    >
      {!delivered && (
        <BeatLoader
          size={5}
          margin={2}
          color="white"
        />
      )}
      <Text size="small">{delivered ? 'delivered' : 'pending'}</Text>
    </Box>
  )
}

function Upgrade({ upgrade, acked }) {
  return (
    <Box
      direction="row"
      align="center"
      pad="small"
      round="xsmall"
      gap="small"
      border={{ side: 'bottom' }}
    >
      <RepoIcon
        size="30px"
        repo={upgrade.repository}
      />
      <Box fill="horizontal">
        <Box
          direction="row"
          gap="small"
          align="center"
        >
          <Text
            size="small"
            weight={500}
          >{upgrade.repository.name}
          </Text>
          <Text
            size="xsmall"
            color="dark-3"
          >{moment(upgrade.insertedAt).format('lll')}
          </Text>
        </Box>
        <Text size="small"><i>{upgrade.message}</i></Text>
      </Box>
      <DeliveryProgress delivered={acked && upgrade.id <= acked} />
    </Box>
  )
}

export function UpgradeQueue() {
  const [listRef, setListRef] = useState(null)
  const { id } = useParams()
  const { data, loading, fetchMore, subscribeToMore, refetch } = useQuery(QUEUE, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  })

  useSubscription(UPGRADE_QUEUE_SUB)

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    variables: { id },
    updateQuery: ({ upgradeQueue, ...rest }, { subscriptionData: { data: { upgrade } } }) => ({ ...rest, upgradeQueue: appendConnection(upgradeQueue, upgrade, 'upgrades') }),
  }), [id, subscribeToMore])

  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([
      { url: '/upgrades', text: 'upgrades' },
      { url: `/upgrades/${id}`, text: id },
    ])
  }, [setBreadcrumbs, id])

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  const queue = data.upgradeQueue
  const { upgrades: { edges, pageInfo }, acked } = queue

  return (
    <Box
      fill
      gap="small"
      pad="small"
      background="background"
    >
      <Container
        title={queue.name || 'default'}
        flex={false}
      >
        <Box
          direction="row"
          gap="small"
          align="center"
          pad="small"
        >
          <Provider
            provider={queue.provider}
            width={45}
          />
          <Box
            fill="horizontal"
            gap="xsmall"
          >
            <Attributes fill="horizontal">
              <Attribute name="domain">
                <Text size="small">{queue.domain}</Text>
              </Attribute>
              <Attribute name="git url">
                <Box
                  direction="row"
                  gap="xsmall"
                  align="center"
                >
                  <Github size="14px" />
                  <Text
                    size="small"
                    color="dark-3"
                  >{queue.git}
                  </Text>
                </Box>
              </Attribute>
              <Attribute name="acked">
                <Text size="small">{acked}</Text>
              </Attribute>
              <Attribute name="pinged">
                <Box
                  direction="row"
                  gap="small"
                  align="center"
                >
                  <Text size="small">{moment(queue.pingedAt).format('lll')}</Text>
                  <QueueHealth
                    queue={queue}
                    size="15px"
                  />
                </Box>
              </Attribute>
            </Attributes>
          </Box>
        </Box>
      </Container>
      <Container
        fill
        title="upgrades"
        modifier={(
          <Box
            flex={false}
            pad="xsmall"
            round="xsmall"
            onClick={() => refetch()}
            hoverIndicator="fill-one"
            focusIndicator={false}
          >
            <Refresh size="small" />
          </Box>
        )}
      >
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          hasNextPage={pageInfo.hasNextPage}
          items={edges}
          loading={loading}
          mapper={({ node }) => (
            <Upgrade
              key={node.id}
              upgrade={node}
              acked={acked}
            />
          )}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { upgradeQueue: { upgrades } } }) => ({
              ...prev, upgradeQueue: extendConnection(prev.upgradeQueue, upgrades, 'upgrades'),
            }),
          })}
        />
      </Container>
    </Box>
  )
}
