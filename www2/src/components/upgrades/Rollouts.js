import React, { useEffect, useState } from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from 'react-apollo'

import { BeatLoader } from 'react-spinners'

import moment from 'moment'

import { StandardScroller } from '../utils/SmoothScroller'

import { appendConnection, extendConnection } from '../../utils/graphql' 
import { HeaderItem } from '../repos/Docker'

import { ROLLOUTS, ROLLOUT_SUB } from './queries'
import { RolloutStatus as Status } from './types'

const ROW_HEIGHT = '50px'
const MAX_UUID = 0xffffffffffffffffffffffffffffffff

const colors = {
  QUEUED: 'light-4',
  RUNNING: 'progress',
  FINISHED: 'good',
}

function progress(cursor) {
  const prog = cursor ? parseInt(cursor.replaceAll('-', ''), 16) : 0

  return Math.floor((prog / MAX_UUID) * 10000) / 100
}

function statusDescription({ status, cursor }) {
  switch (status) {
    case Status.QUEUED:
      return 'queued'
    case Status.FINISHED:
      return 'finished'
    case Status.RUNNING:
      return `${progress(cursor)}% completed`
    default:
      return null
  }
}

function RolloutStatus({ width, rollout }) {
  return (
    <Box
      width={width}
      justify="start"
      direction="row"
    >
      <Box
        flex={false}
        pad={{ horizontal: 'small', vertical: 'xsmall' }}
        background={colors[rollout.status]} 
        direction="row"
        gap="xsmall"
        align="center"
        round="xsmall"
      >
        {rollout.status === RolloutStatus.RUNNING && (
          <BeatLoader
            size={5}
            margin={2}
            color="white"
          />
        )}
        <Text size="small">{statusDescription(rollout)}</Text>
      </Box>
    </Box>
  )
}

function Rollout({ rollout: { event, count, heartbeat, ...rollout } }) {
  return (
    <Box
      pad="small"
      flex={false}
      direction="row"
      gap="xsmall"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom' }}
    >
      <HeaderItem
        text={event}
        width="20%"
      />
      <HeaderItem
        text={`${count} clusters`}
        width="30%"
        nobold
      />
      <HeaderItem
        text={heartbeat ? moment(heartbeat).fromNow() : 'pending'}
        width="30%"
        nobold
      />
      <RolloutStatus
        width="20%"
        rollout={rollout}
      />
    </Box>
  )
}

function RolloutHeader() {
  return (
    <Box
      flex={false}
      pad="small"
      direction="row"
      gap="xsmall"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom' }}
    >
      <HeaderItem
        text="event"
        width="20%"
      />
      <HeaderItem
        text="clusters updated"
        width="30%"
      />
      <HeaderItem
        text="last ping"
        width="30%"
      />
      <HeaderItem
        text="progress"
        width="20%"
      />
    </Box>
  )
}

export function Rollouts({ repository: { id: repositoryId } }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, subscribeToMore, fetchMore } = useQuery(ROLLOUTS, {
    variables: { repositoryId },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => subscribeToMore({
    document: ROLLOUT_SUB,
    variables: { repositoryId },
    updateQuery: (prev, { subscriptionData: { data: { rolloutDelta: { delta, payload } } } }) => delta === 'CREATE' ? appendConnection(prev, payload, 'rollouts') : prev,
  }), [repositoryId])

  if (!data) return null

  const { edges, pageInfo } = data.rollouts

  return (
    <Box fill>
      <RolloutHeader />
      <Box fill>
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          refreshKey={repositoryId}
          hasNextPage={pageInfo.hasNextPage}
          items={edges}
          loading={loading} 
          mapper={({ node }) => <Rollout rollout={node} />} 
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { rollouts } }) => extendConnection(prev, rollouts, 'rollouts'),
          })}
        />
      </Box>
    </Box>
  )
}
