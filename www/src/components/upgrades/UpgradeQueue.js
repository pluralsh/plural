import React, { useEffect } from 'react'
import { useQuery, useSubscription } from 'react-apollo'
import { Loading, Scroller } from 'forge-core'
import { QUEUE, UPGRADE_QUEUE_SUB, UPGRADE_SUB } from './queries'
import { appendConnection, deepUpdate, extendConnection } from '../../utils/graphql'
import { Box, Text } from 'grommet'
import { RepoIcon } from '../repos/Repositories'
import moment from 'moment'
import { BeatLoader } from 'react-spinners'
import { Refresh } from 'grommet-icons'

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
    <Box direction='row' align='center' pad='small' round='xsmall' gap='small' border={{color: 'light-5', side: 'bottom'}}>
      <RepoIcon repo={upgrade.repository} />
      <Box fill='horizontal'>
        <Box direction='row' gap='small' align='center'>
          <Text size='small' weight={500}>{upgrade.repository.name}</Text>
          <Text size='xsmall' color='dark-3'>{moment(upgrade.insertedAt).format('lll')}</Text>
        </Box>
        <Text size='small'><i>{upgrade.message}</i></Text>
      </Box>
      <DeliveryProgress delivered={acked && upgrade.id <= acked} />
    </Box>
  )
}

export function UpgradeQueue() {
  const {data, fetchMore, subscribeToMore, refetch} = useQuery(QUEUE)

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    updateQuery: ({upgradeQueue, ...rest}, {subscriptionData: {data: {upgrade}}}) => {
      console.log(upgrade)
      return {...rest, upgradeQueue: appendConnection(upgradeQueue, upgrade, 'Upgrade', 'upgrades')}
    }
  }), [])

  useSubscription(UPGRADE_QUEUE_SUB)

  if (!data) return <Loading />

  const {upgrades: {edges, pageInfo}, acked} = data.upgradeQueue

  return (
    <Box fill>
      <Box flex={false} pad='small' align='center' background='light-2' direction='row' 
           border={{side: 'bottom', color: 'light-5'}}>
        <Box fill='horizontal'>
          <Text size='small' weight={500}>Upgrade Queue</Text>
        </Box>
        <Box flex={false} pad='xsmall' round='xsmall' onClick={refetch} hoverIndicator='light-3' focusIndicator={false}>
          <Refresh size='small' />
        </Box>
      </Box>
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