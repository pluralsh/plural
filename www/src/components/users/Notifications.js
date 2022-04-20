import React, { useState } from 'react'
import { Box, Stack, Text } from 'grommet'
import { Notification as NotificationI, Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'

import { useHistory } from 'react-router'

import { NOTIFICATIONS_Q } from '../incidents/queries'
import { Flyout } from '../utils/Flyout'
import { Notification as Notif } from '../incidents/Notifications'
import { extendConnection } from '../../utils/graphql'
import { RepoIcon } from '../repos/Repositories'
import { NotificationType } from './types'

const countDetails = ({ edges, pageInfo }) => {
  const len = edges.length
  if (len > 50) return { count: len, more: true }

  return { count: len, more: pageInfo.hasNextPage }
}

function Badge({ notifications }) {
  const { count, more } = countDetails(notifications)

  return (
    <Box
      pad={{ horizontal: 'xxsmall', vertical: '2px' }}
      round="xsmall"
      background="notif"
    >
      <Text size="10px">{count} {more ? '+' : ''}</Text>
    </Box>
  )
}

function notifUrl({type, repository, incident}) {
  if (type === NotificationType.LOCKED) return `/repositories/${repository.id}`
  return `/incidents/${incident.id}`
}

function notifMessage({type, incident}) {
  if (type === NotificationType.LOCKED) return null
  return incident.title
}

function NotificationRow({ notification, next }) {
  const history = useHistory()
  const { incident, repository } = notification

  return (
    <Box
      flex={false}
      direction="row"
      pad="xsmall"
      gap="small"
      align="center"
      hoverIndicator="hover" 
      onClick={() => history.push(notifUrl(notification))}
    >
      <Box fill="horizontal">
        <Notif
          notification={notification}
          next={next}
        />
      </Box>
      <Box
        flex={false}
        direction="row"
        gap="xsmall"
        align="center"
      >
        <Text
          size="small"
          weight={500}
        >{notifMessage(notification)}
        </Text>
        <RepoIcon
          repo={repository || incident.repository}
          round="xsmall"
          size="25px"
        />
      </Box>
    </Box> 
  )
}

function FlyoutBody({ edges, pageInfo, fetchMore, setOpen }) {
  return (
    <Flyout
      width="30vw"
      setOpen={setOpen}
      title="Notifications"
      background="backgroundColor"
    >
      <Scroller
        id="all-notifications"
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }, next) => (
          <NotificationRow
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
    </Flyout>
  )
}

export function Notifications() {
  const [open, setOpen] = useState(false)
  const { data, fetchMore } = useQuery(NOTIFICATIONS_Q)
  const notifications = data && data.notifications

  return (
    <>
      <Stack
        anchor="top-right"
        margin={{ left: 'small' }}
      >
        <Box
          flex={false}
          pad="xsmall"
          hoverIndicator="sidebarHover"
          background="backgroundColor"
          round
          onClick={() => setOpen(!open)}
        >
          <NotificationI size="17px" />
        </Box>
        {notifications && notifications.edges.length > 0 && <Badge notifications={data.notifications} />}
      </Stack>
      {open && (
        <FlyoutBody
          setOpen={setOpen}
          edges={notifications.edges} 
          pageInfo={notifications.pageInfo} 
          fetchMore={fetchMore}
        />
      )}
    </>
  )
}
