import {
  ComponentProps,
  ReactElement,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Avatar,
  Flex,
  Menu,
  MenuItem,
  P,
  Span,
  useOutsideClick,
} from 'honorable'
import {
  ArrowTopRightIcon,
  BellIcon,
  CloseIcon,
  ClusterIcon,
  CompassIcon,
  Sidebar as DSSidebar,
  DiscordIcon,
  GitHubLogoIcon,
  ListIcon,
  LogoutIcon,
  MarketIcon,
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
import { useIsCurrentlyOnboarding } from '../shell/onboarding/useOnboarded'

import CreatePublisherModal from '../publisher/CreatePublisherModal'

import { clearLocalStorage } from '../../helpers/localStorage'

import { NotificationsPanel, useNotificationsCount } from './WithNotifications'

export const SIDEBAR_ICON_HEIGHT = '40px'
export const SIDEBAR_WIDTH = '224px'
export const SMALL_WIDTH = '60px'

type MenuItem = {
  text: string
  icon: ReactElement
  path: string
  pathRegexp?: RegExp
}

/* TODO: Make sure urlRegexp is working with new Sidebar */
const MENU_ITEMS:MenuItem[] = [
  {
    text: 'Marketplace',
    icon: <MarketIcon />,
    path: '/marketplace',
    pathRegexp: /^\/(marketplace|installed|repository|stack)/,
  },
  {
    text: 'Cloud Shell',
    icon: <TerminalIcon />,
    path: '/shell',
    pathRegexp: /^\/(shell|oauth\/callback\/.+\/shell)/,
  },
  {
    text: 'Account',
    icon: <PeopleIcon />,
    path: '/account',
  },
  {
    text: 'Clusters',
    icon: <ClusterIcon />,
    path: '/clusters',
  },
  {
    text: 'Audits',
    icon: <ListIcon />,
    path: '/audits',
  },
  {
    text: 'Roadmap',
    icon: <CompassIcon />,
    path: '/roadmap',
  },
]

function isActiveMenuItem({ path, pathRegexp }: Pick<MenuItem, 'path' | 'pathRegexp'>,
  currentPath) {
  return (
    (path === '/' ? currentPath === path : currentPath.startsWith(path))
    || (pathRegexp && (currentPath.match(pathRegexp)?.length ?? 0 > 0))
  )
}

function SidebarWrapper() {
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()

  return (
    <Sidebar
      transition="width 300ms ease, opacity 200ms ease"
      style={
        isCurrentlyOnboarding
          ? {
            width: '0',
            opacity: '0',
          }
          : null
      }
    />
  )
}

function SidebarMenuItem({
  tooltip,
  href,
  className,
  children,
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
    >
      {children}
    </SidebarItem>
  )
}

function Sidebar(props: ComponentProps<typeof DSSidebar>) {
  const menuItemRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationsPanelRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpened] = useState(false)
  const [collapsed, _setCollapsed] = useState(true)
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen]
    = useState(false)
  const [isCreatePublisherModalOpen, setIsCreatePublisherModalOpen]
    = useState(false)
  const sidebarWidth = collapsed ? 65 : 256 - 32 // 64 + 1px border
  const previousUserData = getPreviousUserData()
  const theme = useTheme()
  const { me } = useContext(CurrentUserContext)
  const menuItems = MENU_ITEMS
  const { pathname } = useLocation()
  const active = useCallback((menuItem: Parameters<typeof isActiveMenuItem>[0]) => isActiveMenuItem(menuItem, pathname),
    [pathname])
  const notificationsCount = useNotificationsCount()

  useOutsideClick(menuRef, event => {
    if (!menuItemRef.current?.contains(event.target as any)) {
      setIsMenuOpened(false)
    }
  })

  useOutsideClick(notificationsPanelRef, () => {
    setIsNotificationsPanelOpen(false)
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
            tooltip="Discord"
            className="sidebar-discord"
            href="https://discord.gg/bEBAMXV64s"
          >
            <DiscordIcon />
          </SidebarMenuItem>
          <SidebarMenuItem
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
            position="relative"
            clickable
            label="Notifications"
            tooltip="Notifications"
            className="sidebar-notifications"
            onClick={event => {
              event.stopPropagation()
              setIsNotificationsPanelOpen(isOpen => !isOpen)
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
            {typeof notificationsCount === 'number'
              && notificationsCount > 0 && (
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
            ref={menuItemRef}
            className="sidebar-menu"
            active={isMenuOpen}
            clickable
            collapsed
            onClick={() => setIsMenuOpened(x => !x)}
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
            color="icon-error"
          >
            <LogoutIcon mr={1} />
            Logout
          </MenuItem>
        </Menu>
      )}
      {/* ---
        NOTIFICATIONS PANEL
      --- */}
      {isNotificationsPanelOpen && (
        <Flex
          position="fixed"
          top={0}
          bottom={0}
          left={sidebarWidth}
          right={0}
          align="flex-end"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          zIndex={theme.zIndexes.selectPopover - 1}
        >
          <Flex
            ref={notificationsPanelRef}
            direction="column"
            backgroundColor="fill-one"
            width={480}
            height={464}
            borderTop="1px solid border"
            borderRight="1px solid border"
            borderTopRightRadius={6}
          >
            <Flex
              align="center"
              justify="space-between"
              padding="medium"
              borderBottom="1px solid border"
            >
              <P subtitle2>Notifications</P>
              <Flex
                align="center"
                justify="center"
                padding="xsmall"
                cursor="pointer"
                _hover={{
                  backgroundColor: 'fill-one-hover',
                }}
                borderRadius="medium"
                onClick={() => setIsNotificationsPanelOpen(false)}
              >
                <CloseIcon />
              </Flex>
            </Flex>
            <Flex
              flexGrow={1}
              direction="column"
              overflowY="auto"
            >
              <NotificationsPanel
                closePanel={() => setIsNotificationsPanelOpen(false)}
              />
            </Flex>
          </Flex>
        </Flex>
      )}
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
