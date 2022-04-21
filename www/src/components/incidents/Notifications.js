import { useEffect } from 'react'
import { Box, Text } from 'grommet'
import { Scroller } from 'forge-core'
import { useApolloClient, useMutation, useQuery, useSubscription } from '@apollo/client'
import moment from 'moment'
import truncate from 'lodash.truncate'

import Avatar from '../users/Avatar'

import { appendConnection, extendConnection, updateCache, updateFragment } from '../../utils/graphql'

import { IncidentFragment } from '../../models/incidents'

import { NOTIFICATIONS_Q, NOTIF_SUB, READ_NOTIFICATIONS } from './queries'
import { NotificationTypes } from './types'

import Markdown from './Markdown'

function notificationModifier(type) {
  switch (type) {
    case NotificationTypes.MESSAGE:
      return 'messaged'
    case NotificationTypes.INCIDENT_UPDATE:
      return 'updated the incident'
    case NotificationTypes.MENTION:
      return 'mentioned you'
    case NotificationTypes.LOCKED:
      return 'locked your installation'
    default:
      return null
  }
}

function NotificationContent({ type, notification }) {
  if (type === NotificationTypes.MESSAGE) {
    return (
      <Text
        size="small"
        color="dark-3"
      >
        "{truncate(notification.message.text, { length: 20 })}"
      </Text>
    )
  }

  if (notification.msg) {
    return (
      <Box style={{ maxHeight: '150px', overflow: 'auto' }}>
        <Markdown text={notification.msg} />
      </Box>
    )
  }

  return null
}

export function Notification({ notification: { actor, type, insertedAt, ...notif } }) {
  return (
    <Box
      flex={false}
      pad={{ horizontal: 'xsmall' }}
      direction="row"
      gap="small"
      align="center"
      margin={{ top: 'xsmall' }}
    >
      <Avatar
        user={actor}
        size="35px"
      />
      <Box>
        <Box
          direction="row"
          gap="xsmall"
          align="center"
          pad="xsmall"
          round="xsmall"
          background="light-2"
          style={{ overflow: 'auto' }}
        >
          <Text
            size="small"
            weight={500}
            style={{ whiteSpace: 'nowrap' }}
          >{notificationModifier(type)}
          </Text>
          <NotificationContent
            notification={notif}
            type={type}
          />
        </Box>
        <Text
          size="xsmall"
          color="dark-3"
        >{moment(insertedAt).format('lll')}
        </Text>
      </Box>
    </Box>
  )
}

export function useNotificationSubscription() {
  const client = useApolloClient()
  useSubscription(NOTIF_SUB, {
    onSubscriptionData: ({ subscriptionData: { data: { notification } } }) => {
      const { incident: { id } } = notification
      try {
        updateCache(client, {
          query: NOTIFICATIONS_Q,
          variables: { incidentId: id },
          update: prev => appendConnection(prev, notification, 'notifications'),
        })
      }
      catch (error) {
         //
      }

      try {
        updateCache(client, {
          query: NOTIFICATIONS_Q,
          variables: {},
          update: prev => appendConnection(prev, notification, 'notifications'),
        })
      }
      catch (error) {
        //
      }

      updateFragment(client, {
        id: `Incident:${id}`,
        fragment: IncidentFragment,
        fragmentName: 'IncidentFragment',
        update: ({ notificationCount, ...rest }) => ({ ...rest, notificationCount: notificationCount + 1 }),
      })
    },
  })
}

export function Notifications({ incident: { id } }) {
  const { data, fetchMore } = useQuery(NOTIFICATIONS_Q, {
    variables: { incidentId: id },
    fetchPolicy: 'cache-and-network',
  })
  const [mutation] = useMutation(READ_NOTIFICATIONS, {
    variables: { incidentId: id },
    update: cache => {
      updateFragment(cache, {
        fragment: IncidentFragment,
        fragmentName: 'IncidentFragment',
        id: `Incident:${id}`,
        update: incident => ({ ...incident, notificationCount: 0 }),
      })
    },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  if (!data) return null

  const { pageInfo, edges } = data.notifications

  return (
    <Box fill>
      <Scroller
        id="notifications"
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }, next) => (
          <Notification
            key={node.id}
            notification={node}
            next={next.node}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { notifications } }) => extendConnection(prev, notifications, 'notifications'),
        })}
      />
    </Box>
  )
}
