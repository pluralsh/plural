import { useQuery } from '@apollo/client'
import { Box } from 'grommet'
import {
  Button,
  Flex,
  MenuItem,
  P,
  Select,
  Span,
} from 'honorable'
import moment from 'moment'
import {
  Chip,
  ClusterIcon,
  ReloadIcon,
  StatusIpIcon,
  StatusOkIcon,
} from 'pluralsh-design-system'
import { useEffect, useMemo, useState } from 'react'

import { appendConnection, extendConnection } from '../../utils/graphql'

import { Header } from '../utils/Header'
import { Provider } from '../repos/misc'
import { RepoIcon } from '../repos/Repositories'
import { StandardScroller } from '../utils/SmoothScroller'

import { ConsoleButton } from './ConsoleButton'

import {
  QUEUE,
  QUEUES,
  UPGRADE_QUEUE_SUB,
  UPGRADE_SUB,
} from './queries'

function QueueItem({ q }: any) {
  return (
    <Flex
      align="center"
      gap="small"
      maxWidth="85%"
    >
      <Provider
        size="24px"
        provider={q.provider}
      />
      <Span
        truncate
        color="text-light"
        flexGrow={1}
      >
        {q.name}
      </Span>
    </Flex>
  )
}

function DataEntry({ name, value, children }: any) {
  return (
    <Box gap="2px">
      <Span color="text-light">{name}</Span>
      {value && <Span fontWeight="bold">{value}</Span>}
      {children}
    </Box>
  )
}

function ClusterDescription({ q }: any) {
  return (
    <Box
      flex={false}
      border
      fill="horizontal"
      direction="row"
      pad="medium"
      round="xsmall"
      background="fill-one"
    >
      <Box
        width="50%"
        gap="small"
      >
        <DataEntry
          name="cluster name"
          value={q.name}
        />
        <DataEntry
          name="domain"
          value={q.domain}
        />
        <DataEntry
          name="acked"
          value={q.acked}
        />
      </Box>
      <Box
        width="50%"
        gap="small"
      >
        <DataEntry name="provider">
          <Provider
            provider={q.provider}
            width={24}
          />
        </DataEntry>
        <DataEntry
          name="git url"
          value={q.git}
        />
        <DataEntry
          name="last pinged"
          value={moment(q.pingedAt).format('lll')}
        />
      </Box>
    </Box>
  )
}

function Upgrade({ upgrade, acked, last }: any) {
  const delivered = acked && upgrade.id <= acked

  return (
    <Box
      pad="small"
      direction="row"
      align="center"
      gap="small"
      border={last ? null : { side: 'bottom' }}
      flex={false}
    >
      <Box
        fill="horizontal"
        direction="row"
        gap="small"
        align="center"
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
            <Span fontWeight="bold">{upgrade.repository.name}</Span>
            <Span color="text-xlight">{moment(upgrade.insertedAt).format('lll')}</Span>
          </Box>
          <Span color="text-light">{upgrade.message}</Span>
        </Box>
      </Box>
      <Box flex={false}>
        <Chip
          severity={delivered ? 'success' : 'neutral'}
          icon={delivered ? <StatusOkIcon /> : <StatusIpIcon />}
          backgroundColor="fill-two"
        >
          {delivered ? 'Delivered' : 'Pending'}
        </Chip>
      </Box>
    </Box>
  )
}

function Upgrades({ q }: any) {
  const [listRef, setListRef] = useState(null)
  const {
    data, loading, fetchMore, subscribeToMore, refetch,
  } = useQuery(QUEUE, {
    variables: { id: q.id },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    variables: { id: q.id },
    updateQuery: ({ upgradeQueue, ...rest }, { subscriptionData: { data: { upgrade } } }) => ({ ...rest, upgradeQueue: appendConnection(upgradeQueue, upgrade, 'upgrades') }),
  }), [q.id, subscribeToMore])

  if (!data) return null

  const queue = data.upgradeQueue
  const { upgrades: { edges, pageInfo }, acked } = queue

  return (
    <Box
      fill
      round="xsmall"
      background="fill-one"
      border
    >
      <Box
        flex={false}
        direction="row"
        align="center"
        pad={{ vertical: 'xsmall', horizontal: 'small' }}
        x
        border={{ side: 'bottom' }}
      >
        <Box fill="horizontal">
          <Span color="text-xlight">UPGRADES</Span>
        </Box>
        <Box flex={false}>
          <Button
            small
            icon={<ReloadIcon size={16} />}
            secondary
            color="text-xlight"
            onClick={refetch}
          >Refresh
          </Button>
        </Box>
      </Box>
      <Box fill>
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          hasNextPage={pageInfo.hasNextPage}
          items={edges}
          loading={loading}
          mapper={({ node }, { next }) => (
            <Upgrade
              key={node.id}
              upgrade={node}
              acked={acked}
              last={!next.node}
            />
          )}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { upgradeQueue: { upgrades } } }) => ({
              ...prev, upgradeQueue: extendConnection(prev.upgradeQueue, upgrades, 'upgrades'),
            }),
          })}
        />
      </Box>
    </Box>
  )
}

function QueueHealth({ q, background }: any) {
  const [now, setNow] = useState(moment())
  const pinged = useMemo(() => moment(q.pingedAt), [q.pingedAt])

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [q.id])

  const healthy = now.subtract(2, 'minutes').isBefore(pinged)

  return (
    <Chip
      severity={healthy ? 'success' : 'error'}
      backgroundColor={background}
    >
      {healthy ? 'Healthy' : 'Unhealthy'}
    </Chip>
  )
}

export function Clusters() {
  const [cluster, setCluster] = useState(null)
  const { data, subscribeToMore } = useQuery(QUEUES, { fetchPolicy: 'cache-and-network' })

  useEffect(() => subscribeToMore({
    document: UPGRADE_QUEUE_SUB,
    updateQuery: ({ upgradeQueues, ...prev }, { subscriptionData: { data: { upgradeQueueDelta: { delta, payload } } } }) => (delta === 'CREATE' ? { ...prev, upgradeQueues: [payload, ...upgradeQueues] } : prev),
  }), [subscribeToMore])

  useEffect(() => {
    if (data) setCluster(data.upgradeQueues[0])
  }, [data])

  if (!data || !cluster) {
    return (
      <Flex
        marginHorizontal="auto"
        paddingTop="xxlarge"
        direction="column"
        align="center"
      >
        <ClusterIcon size={64} />
        <P
          body1
          bold
          marginTop="xlarge"
        >
          You have no clusters registered so far.
        </P>
      </Flex>
    )
  }

  return (
    <Box
      fill
      pad="32px"
      gap="medium"
    >
      <Header
        header="Clusters"
        description="View your clusters and their upgrades"
      />
      <Box
        direction="row"
        fill
        gap="medium"
      >
        <Box
          gap="medium"
          width="40%"
          flex={false}
        >
          <Box
            fill="horizontal"
            direction="row"
            gap="small"
          >
            <Box fill="horizontal">
              <Select
                value={cluster}
                onChange={({ target: { value } }) => setCluster(value)}
              >
                {data.upgradeQueues.map(q => (
                  <MenuItem
                    value={q}
                    key={q.id}
                  >
                    <QueueItem q={q} />
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <ConsoleButton
              small
              text="View Console"
              q={cluster}
            />
            <QueueHealth
              q={cluster}
              background="fill-one"
            />
          </Box>
          <ClusterDescription q={cluster} />
        </Box>
        <Upgrades q={cluster} />
      </Box>
    </Box>
  )
}
