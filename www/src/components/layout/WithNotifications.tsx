import { useMutation, useQuery } from '@apollo/client'
import {
  Notification as NotificationT, NotificationType, OnboardingChecklistState, User,
} from 'generated/graphql'
import { Div, Flex, P } from 'honorable'
import moment from 'moment'
import {
  AppIcon, Button, Card, Markdown,
} from 'pluralsh-design-system'
import { ReactElement, useCallback, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { OnboardingChecklistContext } from '../../contexts/OnboardingChecklistContext'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import { clearOnboardingChecklistState, isOnboardingChecklistHidden } from '../shell/persistance'
import { ONBOARDING_STATUS, UPDATE_ONBOARDING_CHECKLIST } from '../users/queries'
import InfiniteScroller from '../utils/InfiniteScroller'

import { NOTIFICATIONS_QUERY } from './queries'

type WithNotificationsProps = {
  children: ({
    notificationsCount,
  }: {
    notificationsCount: number
  }) => ReactElement | null
}

export function WithNotifications({ children }: WithNotificationsProps) {
  const [notifications] = usePaginatedQuery(NOTIFICATIONS_QUERY,
    { variables: {} },
    data => data.notifications)

  return children({
    notificationsCount: notifications.length,
  })
}

export function NotificationsPanel({ closePanel }) {
  const [
    notifications,
    loadingNotifications,
    hasMoreNotifications,
    fetchMoreNotifications,
  ] = usePaginatedQuery(NOTIFICATIONS_QUERY,
    { variables: {} },
    data => data.notifications)

  const { data } = useQuery<{me: User}>(ONBOARDING_STATUS)
  const showOnboardingNotification = useCallback(() => (data?.me?.onboardingChecklist?.dismissed || isOnboardingChecklistHidden()) && data?.me?.onboardingChecklist?.status !== OnboardingChecklistState.Finished, [data])

  if (showOnboardingNotification() && !notifications.length) {
    return <OnboardingChecklistNotification closePanel={closePanel} />
  }

  if (!notifications.length) {
    return <P padding="medium">You do not have any notifications yet.</P>
  }

  return (
    <Flex
      flexGrow={1}
      direction="column"
    >
      {showOnboardingNotification() && (
        <OnboardingChecklistNotification closePanel={closePanel} />
      )}
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
            closePanel={closePanel}
          />
        ))}
      </InfiniteScroller>
    </Flex>
  )
}

function OnboardingChecklistNotification({ closePanel }) {
  const { setDismissed } = useContext(OnboardingChecklistContext)
  const [updateChecklist, { loading }] = useMutation(UPDATE_ONBOARDING_CHECKLIST)

  return (
    <Flex
      justify="space-between"
      padding="medium"
      borderTop="1px solid border-fill-two"
      borderBottom="1px solid border-fill-two"
    >
      <Flex
        direction="column"
        gap="xxsmall"
        height={40}
      >
        <P
          body2
          bold
        >Get started
        </P>
        <P
          caption
          color="text-light"
        >Get started with our quick start guide.
        </P>
      </Flex>
      <Flex alignItems="center">
        <Button
          secondary
          small
          loading={loading}
          onClick={() => {
            updateChecklist({
              variables: {
                attributes: {
                  onboardingChecklist: {
                    dismissed: false,
                  },
                },
              },
              onCompleted: () => {
                clearOnboardingChecklistState()
                closePanel()
                setDismissed(false)
              },
            })
          }}
        >Open Guide
        </Button>
      </Flex>
    </Flex>
  )
}

const hasMessage = notification => (notification?.type === NotificationType.Message
    && notification?.message?.text)
  || notification.msg

const getUrl = (notification: NotificationT) => {
  if (notification.type === 'LOCKED' && notification?.repository?.id) {
    return `/repository/${notification?.repository?.id}`
  }

  return null

  // May need to add this back when incidents section is restored
  // return `/incident/${notification?.incident?.id}`
}

function HeaderNotificationType({ type }: { type: NotificationType }) {
  let text

  switch (type) {
  case NotificationType.Message:
    return null
  case 'INCIDENT_UPDATE':
    text = 'Updated the incident'
    break
  case 'MENTION':
    text = 'Mentioned you'
    break
  case 'LOCKED':
    text = 'Locked your installation'
    break
  default:
    return null
  }

  return (
    <P
      caption
      color="text-xlight"
    >
      {text}
    </P>
  )
}

function NotificationContent({
  notification,
}: {
  notification: NotificationT
}) {
  if (hasMessage(notification)) {
    return (
      <Div
        maxHeight={150}
        overflow="auto"
        padding="xsmall"
        body2
      >
        {notification?.type === NotificationType.Message ? (
          notification?.message?.text
        ) : (
          <Markdown text={notification?.msg || ''} />
        )}
      </Div>
    )
  }

  return null
}

function Notification({ notification, closePanel }) {
  const { actor, incident, insertedAt } = notification
  const theme = useTheme()

  const url = getUrl(notification)

  return (
    <Flex
      color="inherit"
      textDecoration="none"
      padding="medium"
      align="flex-start"
      width="100%"
    >
      <AppIcon
        url={actor.avatar}
        name={actor.name}
        spacing={actor.avatar ? 'none' : undefined}
        size="xsmall"
      />
      <Flex
        flexDirection="column"
        marginLeft="xsmall"
        gap="xxsmall"
      >
        <Card hue="lighter">
          <Flex
            align="center"
            justifyContent="space-between"
            gap="small"
            padding="xsmall"
            borderBottom={hasMessage(notification) && theme.borders['fill-two']}
            {...(url
              ? {
                as: Link,
                to: url,
                onClick: closePanel,
                color: 'inherit',
                textDecoration: 'none',
              }
              : {})}
          >
            <Div>
              {incident.title && (
                <P
                  body2
                  bold
                  flexShrink={0}
                >
                  <b>{incident.title}</b>
                </P>
              )}
              <HeaderNotificationType type={notification.type} />
            </Div>
            {(incident.repository.darkIcon || incident.repository.icon) && (
              <AppIcon
                url={incident.repository.darkIcon || incident.repository.icon}
                alt={incident.repository.name}
                size="xsmall"
              />
            )}
          </Flex>
          <NotificationContent notification={notification} />
        </Card>
        <P
          caption
          color="text-xlight"
          title={moment(insertedAt).format('MMMM Do YYYY, h:mm:ss a')}
        >
          {moment(insertedAt).fromNow()}
        </P>
      </Flex>
      <Div flexGrow={1} />
    </Flex>
  )
}
