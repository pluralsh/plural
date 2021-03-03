import React from 'react'
import { Box, Text } from 'grommet'
import { Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'
import { NOTIFICATIONS_Q } from './queries'
import Avatar from '../users/Avatar'
import { NotificationTypes } from './types'
import { dateFormat } from '../../utils/date'
import moment from 'moment'
import { extendConnection } from '../../utils/graphql'

function notificationModifier(type) {
  switch (type) {
    case NotificationTypes.MESSAGE:
      return 'messaged'
    case NotificationTypes.INCIDENT_UPDATE:
      return 'updated the incident'
    default:
      return null
  }
}

function Notification({notification: {actor, type, insertedAt}}) {
  return (
    <Box flex={false} pad={{horizontal: 'xsmall'}} direction='row' gap='small' align='center' margin={{top: 'xsmall'}}>
      <Avatar user={actor} size='35px' />
      <Box>
        <Text size='small' color='dark-3'>{dateFormat(moment(insertedAt))}</Text>
        <Box direction='row' gap='xsmall' align='center' pad='xsmall' round='xsmall' background='light-2' style={{overflow: 'auto'}}>
          <Text size='small' weight={500} style={{whiteSpace: 'nowrap'}}>{notificationModifier(type)}</Text>   
        </Box>
      </Box>
    </Box>
  )
}

export function Notifications({incident: {id}}) {
  const {data, fetchMore} = useQuery(NOTIFICATIONS_Q, {
    variables: {incidentId: id}, 
    fetchPolicy: 'cache-and-network'
  })

  if (!data) return null

  const {pageInfo, edges} = data.notifications

  return (
    <Box fill>
      <Scroller
        id='notifications'
        style={{width: '100%', height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}, next) => <Notification key={node.id} notification={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'notifications')
        })}
      />
    </Box>
  )
}