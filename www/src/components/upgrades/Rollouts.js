import React, { useEffect, useState } from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from 'react-apollo'
import { StandardScroller } from '../utils/SmoothScroller'
import { ROLLOUTS, ROLLOUT_SUB } from './queries'
import { appendConnection, extendConnection } from '../../utils/graphql' 
import { HeaderItem } from '../repos/Docker'
import { BeatLoader } from 'react-spinners'
import moment from 'moment'

const ROW_HEIGHT = '50px'
const MAX_UUID = Math.pow(2, 128)

const colors = {
  'QUEUED': 'light-4',
  'RUNNING': 'progress',
  'FINISHED': 'ok'
}

function statusDescription({status, cursor}) {
  switch (status) {
    case RolloutStatus.QUEUED:
      return 'queued'
    case RolloutStatus.FINISHED:
      return 'finished'
    case RolloutStatus.RUNNING:
      const prog = cursor ? parseInt(cursor.replace('-', ''), 16) : 0
      return `${Math.floor((prog / MAX_UUID) * 100)}% completed`
    default:
      return null
  }
}

function RolloutStatus({width, rollout}) {
  return (
    <Box width={width} >
      <Box pad={{horizontal: 'small', vertical: 'xsmall'}} background={colors[rollout.status]} 
           direction='row' gap='xsmall' align='center'>
        {rollout.status === RolloutStatus.RUNNING && <BeatLoader size={5} margin={2} color='white' />}
        <Text size='small'>{statusDescription(rollout)}</Text>
      </Box>
    </Box>
  )
}

function Rollout({rollout}) {
  return (
    <Box pad='small' flex={false} direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom', color: 'light-3'}}>
      <HeaderItem text={rollout.event} width='20%' />
      <HeaderItem text={`${rollout.count} clusters`} width='20%' nobold />
      <HeaderItem text={moment(rollout.heartbeat).fromNow()} width='20%' nobold />
      <RolloutStatus width='40%' rollout={rollout} />
    </Box>
  )
}

function RolloutHeader() {
  return (
    <Box flex={false} pad='small' direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom', color: 'light-5'}}>
      <HeaderItem text='event' width='20%' />
      <HeaderItem text='clusters updated' width='20%' />
      <HeaderItem text='last ping' width='20%' />
      <HeaderItem text='progress' width='40%' />
    </Box>
  )
}

export function Rollouts({repository: {id: repositoryId}}) {
  const [listRef, setListRef] = useState(null)
  const {data, loading, subscribeToMore, fetchMore} = useQuery(ROLLOUTS, {
    variables: {repositoryId},
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => subscribeToMore({
    document: ROLLOUT_SUB,
    variables: {repositoryId},
    updateQuery: (prev, {subscriptionData: {data: {delta, payload}}}) => {
      return delta === 'CREATE' ? appendConnection(prev, payload, 'rollouts') : prev
    }
  }), [repositoryId])

  if (!data) return null

  const {edges, pageInfo} = data.rollouts

  return (
    <Box fill>
      <RolloutHeader />
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        refreshKey={repositoryId}
        hasNextPage={pageInfo.hasNextPage}
        items={edges}
        loading={loading} 
        mapper={({node}) => <Rollout rollout={node} />} 
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {rollouts}}) => extendConnection(prev, rollouts, 'rollouts')
        })} />
    </Box>
  )
}