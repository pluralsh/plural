import React, { useEffect } from 'react'
import { useQuery, useSubscription } from 'react-apollo'
import { Loading, Scroller } from 'forge-core'
import { QUEUE, UPGRADE_QUEUE_SUB, UPGRADE_SUB } from './queries'
import { appendConnection, deepUpdate, extendConnection } from '../../utils/graphql'
import { Box, Text } from 'grommet'
import { RepoIcon } from '../repos/Repositories'
import moment from 'moment'
import { BeatLoader } from 'react-spinners'

function DeliveryProgress({delivered}) {
  return (
    <Box flex={false} pad={{horizontal: 'small', vertical: 'xsmall'}} background={delivered ? 'success' : 'progress'}
        direction='row' gap='small' round='xsmall'>
      {!delivered && <BeatLoader size={5} margin={2} color='white' />}
      <Text size='small'>{delivered ? 'delivered' : 'pending'}</Text>
    </Box>
  )
}

function Upgrade({upgrade, acked}) {
  return (
    <Box direction='row' align='center' pad='small' round='xsmall' gap='small' border={{color: 'light-5'}} margin={{bottom: 'xsmall'}}>
      <RepoIcon repo={upgrade.repository} />
      <Box fill='horizontal'>
        <Box direction='row' gap='small' align='center'>
          <Text size='small' weight={500}>{upgrade.repository.name}</Text>
          <Text size='xsmall' color='dark-3'>{moment(upgrade.insertedAt).format('lll')}</Text>
        </Box>
        <Text size='small'><i>{upgrade.message}</i></Text>
      </Box>
      <DeliveryProgress delivered={acked && upgrade.id < acked} />
    </Box>
  )
}

export function UpgradeQueue() {
  const {data, fetchMore, subscribeToMore} = useQuery(QUEUE)

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    updateQuery: (prev, {subsciptionData: {data: {upgrade}}}) => deepUpdate(
      prev, 'upgradeQueue', (q) => appendConnection(q, upgrade, 'Upgrade', 'upgrades')
    )
  }), [])

  useSubscription(UPGRADE_QUEUE_SUB)

  if (!data) return <Loading />

  const {upgrades: {edges, pageInfo}, acked} = data.upgradeQueue

  return (
    <Box fill pad='small' gap='small'>
      <Text size='small' weight='bold'>Upgrade Queue</Text>
      <Box fill>
        <Scroller 
          id='webhooks'
          style={{width: '100%', height: '100%', overflow: 'auto'}}
          edges={edges}
          mapper={({node}) => <Upgrade key={node.id} upgrade={node} acked={acked} />}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {upgradeQueue: {upgrades}}}) => ({
              ...prev, upgradeQueue: extendConnection(prev.upgradeQueue, upgrades, 'upgrades')
            })
          })}
        />
      </Box>
    </Box>
  )
}