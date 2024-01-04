import {
  ComponentProps,
  ReactElement,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Avatar, Flex, Menu, MenuItem, Span, useOutsideClick } from 'honorable'
import {
  ArrowTopRightIcon,
  BellIcon,
  BrowseAppsIcon,
  ClusterIcon,
  CompassIcon,
  CookieIcon,
  Sidebar as DSSidebar,
  DiscordIcon,
  GitHubLogoIcon,
  ListIcon,
  LogoutIcon,
  MarketPlusIcon,
  PeopleIcon,
  PersonIcon,
  ScrollIcon,
  SidebarItem,
  SidebarSection,
  TerminalIcon,
} from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { getPreviousUserData } from '../../helpers/authentication'
import { handlePreviousUserClick } from '../login/CurrentUser'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { useIsCurrentlyOnboarding } from '../shell/hooks/useOnboarded'
import CreatePublisherModal from '../publisher/CreatePublisherModal'
import { clearLocalStorage } from '../../helpers/localStorage'

import Cookiebot from '../../utils/cookiebot'

import { useReadNotificationsMutation } from '../../generated/graphql'

import { useNotificationsCount } from './WithNotifications'
import { NotificationsPanelOverlay } from './NotificationsPanelOverlay'

export const SIDEBAR_ICON_HEIGHT = '40px'
export const SIDEBAR_WIDTH = '224px'
export const SMALL_WIDTH = '60px'

type MenuItem = {
  text: string
  icon: ReactElement
  path: string
  pathRegexp?: RegExp
}

const MENU_ITEMS: MenuItem[] = [
  {
    text: 'Clusters',
    icon: <ClusterIcon />,
    path: '/overview',
    pathRegexp: /^\/(overview|clusters|apps)/,
  },
  {
    text: 'Cloud Shell',
    icon: <TerminalIcon />,
    path: '/shell',
    pathRegexp: /^\/(shell|oauth\/callback\/.+\/shell)/,
  },
  {
    text: 'Marketplace',
    icon: <BrowseAppsIcon />,
    path: '/marketplace',
    pathRegexp: /^\/(marketplace|installed|repository|stack)/,
  },
  {
    text: 'Audits',
    icon: <ListIcon />,
    path: '/audits',
  },
  {
    text: 'Account',
    icon: <PeopleIcon />,
    path: '/account',
  },
  {
    text: 'Roadmap',
    icon: <CompassIcon />,
    path: '/roadmap',
  },
]

function isActiveMenuItem(
  { path, pathRegexp }: Pick<MenuItem, 'path' | 'pathRegexp'>,
  currentPath
) {
  return (
    (path === '/' ? currentPath === path : currentPath.startsWith(path)) ||
    (pathRegexp && (currentPath.match(pathRegexp)?.length ?? 0 > 0))
  )
}

function SidebarWrapper() {
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()

  return (
    <Sidebar
      variant="app"
      transition="width 300ms ease, opacity 200ms ease"
      style={isCurrentlyOnboarding ? { display: 'none' } : null}
    />
  )
}

function SidebarMenuItem({
  tooltip,
  href,
  className,
  children,
  ...props
}: {
  tooltip: string
  href?: string
  className?: string
  children: JSX.Element
}) {
  return (
    <SidebarItem
      clickable
      tooltip={tooltip}
      href={href}
      height={32}
      width={32}
      className={className}
      {...props}
    >
      {children}
    </SidebarItem>
  )
}

function Sidebar(props: ComponentProps<typeof DSSidebar>) {
  const menuItemRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpened] = useState(false)
  const [collapsed, _setCollapsed] = useState(true)
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
    useState(false)
  const [isCreatePublisherModalOpen, setIsCreatePublisherModalOpen] =
    useState(false)
  const sidebarWidth = collapsed ? 65 : 256 - 32 // 64 + 1px border
  const previousUserData = getPreviousUserData()
  const theme = useTheme()
  const me = useContext(CurrentUserContext)
  const menuItems = MENU_ITEMS
  const { pathname } = useLocation()
  const active = useCallback(
    (menuItem: Parameters<typeof isActiveMenuItem>[0]) =>
      isActiveMenuItem(menuItem, pathname),
    [pathname]
  )
  const [readNotifications] = useReadNotificationsMutation()
  const notificationsCount = useNotificationsCount()
  const toggleNotifPanel = useCallback(
    (open) => {
      setIsNotificationsPanelOpen(open)
      if (!open) {
        readNotifications()
      }
    },
    [setIsNotificationsPanelOpen, readNotifications]
  )

  useOutsideClick(menuRef, (event) => {
    if (!menuItemRef.current?.contains(event.target as any)) {
      setIsMenuOpened(false)
    }
  })

  const switchPrevious = () => handlePreviousUserClick(previousUserData)

  function handleLogout() {
    clearLocalStorage()
    ;(window as Window).location = '/'
  }

  return (
    <>
      <DSSidebar
        backgroundColor={theme.colors?.['fill-one']}
        {...props}
      >
        <SidebarSection
          grow={1}
          shrink={1}
        >
          {/* ---
          MENU ITEMS
        --- */}
          {menuItems.map((item, i) => {
            const isActive = active(item)

            return (
              <SidebarItem
                data-phid={`sidebar-item-${item.text
                  .split(' ')
                  .join('')
                  .toLowerCase()}`}
                key={i}
                clickable
                tooltip={item.text}
                className={`sidebar-${item.text}`}
                as={Link}
                to={item.path}
                backgroundColor={
                  isActive ? theme.colors?.['fill-one-selected'] : null
                }
                _hover={{
                  backgroundColor: isActive
                    ? theme.colors?.['fill-one-selected']
                    : theme.colors?.['fill-one-hover'],
                  cursor: 'pointer',
                }}
                borderRadius="normal"
                height={32}
                width={32}
              >
                {item.icon}
              </SidebarItem>
            )
          })}
          <Flex grow={1} />
          {/* ---
          SOCIAL
        --- */}
          <SidebarMenuItem
            data-phid="sidebar-item-discord"
            tooltip="Discord"
            className="sidebar-discord"
            href="https://discord.gg/pluralsh"
          >
            <DiscordIcon />
          </SidebarMenuItem>
          <SidebarMenuItem
            data-phid="sidebar-item-github"
            tooltip="GitHub"
            className="sidebar-github"
            href="https://github.com/pluralsh/plural"
          >
            <GitHubLogoIcon />
          </SidebarMenuItem>
          {/* ---
          NOTIFICATIONS BELL
        --- */}
          <SidebarItem
            data-phid="sidebar-item-notifications"
            position="relative"
            clickable
            label="Notifications"
            tooltip="Notifications"
            className="sidebar-notifications"
            onClick={(event) => {
              event.stopPropagation()
              toggleNotifPanel((isOpen) => !isOpen)
            }}
            backgroundColor={
              isNotificationsPanelOpen
                ? theme.colors?.['fill-one-selected']
                : null
            }
            width={32}
            height={32}
          >
            <BellIcon />
            {typeof notificationsCount === 'number' &&
              notificationsCount > 0 && (
                <Flex
                  color="white"
                  backgroundColor="error"
                  borderRadius="100%"
                  fontSize={11}
                  align="start"
                  justify="center"
                  height={15}
                  width={15}
                  position="absolute"
                  left={16}
                  top={2}
                >
                  <Span marginTop={-2}>
                    {notificationsCount > 99 ? '!' : notificationsCount}
                  </Span>
                </Flex>
              )}
          </SidebarItem>
          {/* ---
          USER
        --- */}
          <SidebarItem
            data-phid="sidebar-item-user"
            ref={menuItemRef}
            className="sidebar-menu"
            active={isMenuOpen}
            clickable
            collapsed
            onClick={() => setIsMenuOpened((x) => !x)}
            userSelect="none"
          >
            <Avatar
              name={me.name}
              src={me.avatar}
              size={32}
            />
          </SidebarItem>
        </SidebarSection>
      </DSSidebar>
      {/* ---
        MENU
      --- */}
      {isMenuOpen && (
        <Menu
          ref={menuRef}
          zIndex={999}
          position="absolute"
          bottom={8}
          minWidth="175px"
          left={sidebarWidth + 8}
          border="1px solid border"
          // Fix incorrect borders due to mixed element types
          {...{
            '&, &>*:first-of-type:not(:first-child) > div': {
              borderTop: theme.borders['fill-two'],
            },
          }}
          onClick={() => setIsMenuOpened(false)}
        >
          <MenuItem
            as={Link}
            to="/profile"
            color="inherit"
            textDecoration="none"
          >
            <PersonIcon mr={1} />
            My profile
          </MenuItem>
          <MenuItem
            color="inherit"
            textDecoration="none"
            onClick={() => {
              Cookiebot?.show()
            }}
          >
            <CookieIcon marginRight="small" />
            Cookie settings
          </MenuItem>
          <MenuItem
            as="a"
            href="https://docs.plural.sh"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            textDecoration="none"
          >
            <ScrollIcon mr={1} />
            Docs
            <Flex flexGrow={1} />
            <ArrowTopRightIcon />
          </MenuItem>
          <MenuItem onClick={() => setIsCreatePublisherModalOpen(true)}>
            <MarketPlusIcon mr={1} />
            Create a publisher
          </MenuItem>
          {!!previousUserData && (
            <MenuItem onClick={switchPrevious}>
              <LogoutIcon mr={1} />
              Log back as {previousUserData.me.email}
            </MenuItem>
          )}
          <MenuItem
            onClick={handleLogout}
            color={theme.colors['icon-danger']}
          >
            <LogoutIcon mr={1} />
            Logout
          </MenuItem>
        </Menu>
      )}
      {/* ---
        NOTIFICATIONS PANEL
      --- */}
      <NotificationsPanelOverlay
        leftOffset={sidebarWidth}
        isOpen={isNotificationsPanelOpen}
        setIsOpen={toggleNotifPanel}
      />
      {/* ---
        CREATE PUBLISHER MODAL
      --- */}
      <CreatePublisherModal
        open={isCreatePublisherModalOpen}
        onClose={() => setIsCreatePublisherModalOpen(false)}
      />
    </>
  )
}

export default SidebarWrapper
