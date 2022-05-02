import { useCallback, useState } from 'react'
import { Box, Stack, Text } from 'grommet'
import { Cluster, Eye as Hide, History, Notification, Package, User } from 'forge-core'

import { IncidentHistory } from './IncidentHistory'
import { SidebarView } from './types'
import { ViewOption } from './ViewSwitcher'
import { Notifications } from './Notifications'
import { NotificationBadge } from './Incidents'
import { Followers } from './Followers'
import { Subscription } from './Subscription'
import { ClusterInformation } from './ClusterInformation'

const animation = {
  outline: 'none',
  transition: 'width 0.75s cubic-bezier(0.000, 0.795, 0.000, 1.000)',
}

function NotificationIcon({ incident, ...props }) {
  return (
    <Stack anchor="top-right">
      <Notification {...props} />
      {incident.notificationCount > 0 && <NotificationBadge size="10px" />}
    </Stack>
  )
}

function SmallSidebar({ incident, setOpen, setView }) {
  const doOpen = useCallback(view => {
    setView(view)
    setOpen(true)
  }, [setOpen, setView])
  const WrappedNotification = useCallback(props => (
    <NotificationIcon
      {...props}
      incident={incident}
    />
  ), [incident])

  return (
    <Box
      fill
      gap="small"
      align="center"
      pad={{ top: 'small' }}
    >
      <ViewOption
        icon={History}
        view={SidebarView.HISTORY}
        setView={doOpen}
        side={{ right: 'left' }}
        text="history"
      />
      <ViewOption
        icon={WrappedNotification}
        view={SidebarView.NOTIF}
        setView={doOpen}
        side={{ right: 'left' }}
        text="notifications"
      />
      <ViewOption
        icon={User}
        view={SidebarView.FOLLOW}
        setView={doOpen}
        side={{ right: 'left' }}
        text="followers"
      />
      <ViewOption
        icon={Cluster}
        view={SidebarView.CLUSTER}
        setView={doOpen}
        side={{ right: 'left' }}
        text="cluster"
      />
      {incident.subscription && (
        <ViewOption
          icon={Package}
          view={SidebarView.SUBSCRIPTION}
          setView={doOpen}
          side={{ right: 'left' }}
          text="subscription"
        />
      )}
    </Box>
  )
}

function SidebarContent({ view, setView, incident, fetchMore, setOpen }) {
  return (
    <Box fill>
      <Box
        flex={false}
        direction="row"
        justify="end"
        align="center"
        pad="xsmall"
        gap="xsmall"
        border={{ side: 'bottom', color: 'border' }}
      >
        <Box
          direction="row"
          fill="horizontal"
          align="center"
          pad={{ horizontal: 'xsmall' }}
          gap="small"
        >
          <Box
            flex={false}
            width="25px"
            onClick={() => setOpen(false)}
            pad="xsmall"
            round="xsmall"
            hoverIndicator="light-2"
            align="center"
            justify="center"
          >
            <Hide size="15px" />
          </Box>
          <Text
            size="small"
            weight={500}
          >{view}
          </Text>
        </Box>
        <ViewOption
          icon={Notification}
          size="15px"
          width="25px"
          view={SidebarView.NOTIF}
          selected={view}
          setView={setView}
          side={{ top: 'bottom' }}
          text="notifications"
        />
        <ViewOption
          icon={History}
          size="15px"
          width="25px"
          view={SidebarView.HISTORY}
          selected={view}
          setView={setView}
          side={{ top: 'bottom' }}
          text="history"
        />
        <ViewOption
          icon={User}
          size="15px"
          width="25px"
          view={SidebarView.FOLLOW}
          selected={view}
          setView={setView}
          side={{ top: 'bottom' }}
          text="followers"
        />
        <ViewOption
          icon={Cluster}
          size="15px"
          width="25px"
          view={SidebarView.CLUSTER}
          selected={view}
          setView={setView}
          side={{ top: 'bottom' }}
          text="cluster"
        />
        {incident.subscription && (
          <ViewOption
            icon={Package}
            size="15px"
            width="25px"
            view={SidebarView.SUBSCRIPTION}
            selected={view}
            setView={setView}
            side={{ top: 'bottom' }}
            text="subscription"
          />
        )}
      </Box>
      <Box fill>
        {view === SidebarView.NOTIF && <Notifications incident={incident} />}
        {view === SidebarView.HISTORY && (
          <IncidentHistory
            incident={incident}
            fetchMore={fetchMore}
          />
        )}
        {view === SidebarView.FOLLOW && (
          <Followers
            incident={incident}
            fetchMore={fetchMore}
          />
        )}
        {view === SidebarView.SUBSCRIPTION && <Subscription incident={incident} />}
        {view === SidebarView.CLUSTER && <ClusterInformation incident={incident} />}
      </Box>
    </Box>
  )
}

export function Sidebar({ incident, fetchMore }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(SidebarView.HISTORY)

  return (
    <Box
      flex={false}
      style={animation}
      width={open ? '25%' : '50px'}
      border={{ side: 'left', color: 'border' }}
    >
      {!open && (
        <SmallSidebar
          open={open}
          setOpen={setOpen}
          setView={setView}
          incident={incident}
        />
      )}
      {open && (
        <SidebarContent
          view={view}
          setView={setView}
          setOpen={setOpen}
          incident={incident}
          fetchMore={fetchMore}
        />
      )}
    </Box>
  )
}
