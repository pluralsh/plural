import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Div, Flex, Img, P } from 'honorable'
import { CloseIcon } from 'pluralsh-design-system'
import truncate from 'lodash.truncate'
import moment from 'moment'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import InfiniteScroller from '../utils/InfiniteScroller'
import Markdown from '../incidents/Markdown'

import { NOTIFICATIONS_QUERY } from './queries'

function WithNotifications({ children }) {
  const [notifications, loadingNotifications, hasMoreNotifications, fetchMoreNotifications] = usePaginatedQuery(
    NOTIFICATIONS_QUERY,
    { variables: {} },
    data => data.notifications
  )
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  return (
    <Flex>
      {children({
        notificationsCount: notifications.length,
        toggleNotificationsPanel: () => setIsPanelOpen(x => !x),
        isNotificationsPanelOpen: isPanelOpen,
      })}
      {isPanelOpen && (
        <Flex
          direction="column"
          borderRight="1px solid border"
          width={512}
          maxWidth={512}
        >
          <Flex
            align="center"
            px={1}
            height={57}
            flexShrink={0}
            borderBottom="1px solid border"
          >
            <P ml={1}>
              Notifications
            </P>
            <Div flexGrow={1} />
            <Flex
              p={0.5}
              mr={-0.25}
              align="center"
              justify="center"
              hoverIndicator="fill-one"
              cursor="pointer"
              borderRadius="50%"
              onClick={() => setIsPanelOpen(false)}
            >
              <CloseIcon size={12} />
            </Flex>
          </Flex>
          <Flex
            direction="column"
            flexGrow={1}
          >
            <InfiniteScroller
              loading={loadingNotifications}
              hasMore={hasMoreNotifications}
              loadMore={fetchMoreNotifications}
              // Allow for scrolling in a flexbox layout
              flexGrow={1}
              height={0}
            >
              {notifications.map(notification => (
                <Notification
                  key={notification.id}
                  notification={notification}
                  closePanel={() => setIsPanelOpen(false)}
                />
              ))}
            </InfiniteScroller>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

function Notification({ notification, closePanel }) {
  console.log('notification', notification)
  const { actor, type, repository, incident, insertedAt } = notification

  function getUrl() {
    if (type === 'LOCKED') return `/repository/${repository.id}`

    return `/incident/${incident.id}`
  }

  function renderType() {
    switch (type) {
      case 'MESSAGE':
        return null
      case 'INCIDENT_UPDATE':
        return 'Updated the incident'
      case 'MENTION':
        return 'Mentioned you'
      case 'LOCKED':
        return 'Locked your installation'
      default:
        return null
    }
  }

  function renderContent() {
    if (type === 'MESSAGE') {
      return (
        <P body3>
          "{truncate(notification.message.text, { length: 21 })}"
        </P>
      )
    }

    if (notification.msg) {
      return (
        <Div
          maxHeight={150}
          overflow="auto"
        >
          <Markdown text={notification.msg} />
        </Div>
      )
    }

    return null
  }

  return (
    <Flex
      as={Link}
      to={getUrl()}
      onClick={closePanel}
      color="inherit"
      textDecoration="none"
      p={1}
      align="flex-start"
      hoverIndicator="fill-one"
      cursor="pointer"
    >
      <Avatar
        src={actor.avatar}
        name={actor.name}
      />
      <Div
        ml={0.5}
        flexShrink={0}
      >
        <Div
          p={0.5}
          borderRadius={4}
          backgroundColor="grey.100"
          color="background"
        >
          <P body3>
            {renderType()}
          </P>
          {renderContent()}
        </Div>
        <P
          body3
          color="text-xlight"
          title={moment(insertedAt).format('MMMM Do YYYY, h:mm:ss a')}
        >
          {moment(insertedAt).fromNow()}
        </P>
      </Div>
      <Div flexGrow={1} />
      <Flex align="center">
        <P flexShrink={0}>
          {incident.title}
        </P>
        <Img
          ml={0.5}
          flexShrink={0}
          width={32}
          src={incident.repository.darkIcon || incident.repository.icon}
          alt={incident.repository.name}
        />
      </Flex>
    </Flex>
  )
}

export default WithNotifications
