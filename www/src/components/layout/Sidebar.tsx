import {
  forwardRef,
  useContext,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Avatar,
  Div,
  Flex,
  Img,
  Menu,
  MenuItem,
  P,
  useOutsideClick,
} from 'honorable'
import {
  ArchitectureIcon,
  ArrowTopRightIcon,
  BellIcon,
  CloseIcon,
  ClusterIcon,
  DiscordIcon,
  GitHubLogoIcon,
  ListIcon,
  LogoutIcon,
  MarketIcon,
  MarketPlusIcon,
  PeopleIcon,
  PersonIcon,
  ScrollIcon,
  TerminalIcon,
  Tooltip,
} from '@pluralsh/design-system'

import { getPreviousUserData } from '../../helpers/authentication'
import { handlePreviousUserClick } from '../login/CurrentUser'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { useIsCurrentlyOnboarding } from '../shell/onboarding/useOnboarded'

import CreatePublisherModal from '../publisher/CreatePublisherModal'

import { clearLocalStorage } from '../../helpers/localStorage'

import { NotificationsPanel, WithNotifications } from './WithNotifications'

export const SIDEBAR_ICON_HEIGHT = '40px'
export const SIDEBAR_WIDTH = '224px'
export const SMALL_WIDTH = '60px'

function SidebarWrapper() {
  const { me } = useContext(CurrentUserContext)
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()
  const { pathname } = useLocation()

  const items = [
    {
      name: 'Marketplace',
      Icon: MarketIcon,
      url: '/marketplace',
      urlRegexp: /^\/(marketplace|installed|repository)/,
    },
    {
      name: 'Cloud Shell',
      Icon: TerminalIcon,
      url: '/shell',
      urlRegexp: /^\/(shell|oauth\/callback\/.+\/shell)/,
    },
    {
      name: 'Account',
      Icon: PeopleIcon,
      url: '/account',
    },
    {
      name: 'Clusters',
      Icon: ClusterIcon,
      url: '/clusters',
    },
    {
      name: 'Audits',
      Icon: ListIcon,
      url: '/audits',
    },
    {
      name: 'Roadmap',
      Icon: ArchitectureIcon,
      url: '/roadmap',
    },
  ]

  return (
    <WithNotifications>
      {({ notificationsCount }) => (
        <Sidebar
          transition="width 300ms ease, opacity 200ms ease"
          style={isCurrentlyOnboarding ? {
            width: '0',
            opacity: '0',
          } : null}
          items={items}
          activeId={pathname}
          notificationsCount={notificationsCount}
          userName={me.name}
          userImageUrl={me.avatar}
          userAccount={me.account?.name}
        />
      )}
    </WithNotifications>
  )
}

function TransitionText({ collapsed, ...props }: any) {
  return (
    <P
      display="block"
      opacity={collapsed ? 0 : 1}
      visibility={collapsed ? 'hidden' : 'visible'}
      transition={`opacity ${collapsed ? 200 : 500}ms ease, background-color ${collapsed ? 200 : 500}ms ease ${collapsed ? 0 : 50}ms, visibility 200ms linear, color 150ms linear`}
      {...props}
    />
  )
}

function SidebarItemRef({
  active,
  highlight,
  collapsed,
  startIcon,
  endIcon,
  label,
  tooltip,
  badge = 0,
  linkTo,
  ...otherProps
},
ref) {
  const [hovered, setHovered] = useState(false)

  function wrapLink(node) {
    if (!linkTo) return node

    if (linkTo.startsWith('http')) {
      return (
        <a
          href={linkTo}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          {node}
        </a>
      )
    }

    return (
      <Link
        to={linkTo}
        style={{ textDecoration: 'none' }}
      >
        {node}
      </Link>
    )
  }

  function wrapTooltip(node) {
    if (!tooltip) return node

    return (
      <Tooltip
        arrow
        placement="right"
        label={tooltip}
        zIndex={9999999}
        visibility={collapsed ? 'visible' : 'hidden'}
        display={hovered ? 'block' : 'none'}
        whiteSpace="nowrap"
      >
        {node}
      </Tooltip>
    )
  }

  function renderItem() {
    return (
      <Flex
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        pt="13px" // Give it a square look with a weird padding
        pb="6px"
        px={0.75}
        align="center"
        borderRadius="normal"
        cursor="pointer"
        {...{ '& *': { color: highlight ? 'text-warning-light' : active ? 'text' : 'text-light' } }}
        backgroundColor={active ? 'fill-zero-selected' : null}
        _hover={{
          '& *': { color: highlight ? 'text-warning-light' : 'text' },
          backgroundColor: active ? 'fill-zero-selected' : 'fill-zero-hover',
        }}
        {...otherProps}
      >
        <Flex
          align="center"
          justify="center"
          position="relative"
        >
          <Div {...{ '& *': { transition: 'color 150ms linear' } }}>
            {startIcon}
          </Div>
          {badge > 0 && (
            <Flex
              align="center"
              justify="center"
              position="absolute"
              backgroundColor="icon-error"
              borderRadius="50%"
              fontSize={8}
              width={10}
              height={10}
              top={-6}
              right={-8}
            >
              {badge}
            </Flex>
          )}
        </Flex>
        <Flex
          ml={1}
          mr={endIcon ? -0.25 : 0}
          marginTop="-4px"
          flexShrink={0}
          align="center"
          flexGrow={1}
          opacity={collapsed ? 0 : 1}
          visibility={collapsed ? 'hidden' : 'visible'}
          transition={`opacity ${collapsed ? 200 : 500}ms ease, background-color ${collapsed ? 200 : 500}ms ease ${collapsed ? 0 : 50}ms, visibility 200ms linear, color 150ms linear`}
        >
          {label}
          <Div
            ml={1}
            flexGrow={1}
          />
          {endIcon}
        </Flex>
      </Flex>
    )
  }

  return wrapLink(wrapTooltip(renderItem()))
}

const SidebarItem = forwardRef(SidebarItemRef)

function Sidebar({
  activeId = '',
  items = [],
  notificationsCount = 0,
  userImageUrl,
  userName,
  userAccount,
  ...props
}: any) {
  const menuItemRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationsPanelRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpened] = useState(false)
  const [collapsed, _setCollapsed] = useState(true)
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false)
  const [isCreatePublisherModalOpen, setIsCreatePublisherModalOpen] = useState(false)
  const sidebarWidth = collapsed ? 65 : 256 - 32 // 64 + 1px border
  const previousUserData = getPreviousUserData()

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
      <Flex
        direction="column"
        flexGrow={0}
        flexShrink={0}
        width={sidebarWidth}
        height="100vh"
        maxHeight="100vh"
        borderRight="1px solid border"
        userSelect="none"
        transition="width 300ms ease"
        position="relative"
        {...props}
      >
        {/* ---
          HEADER
        --- */}
        <Link to="/">
          <Flex
            py={1}
            pl={1.25}
            flexShrink={0}
            align="center"
            borderBottom="1px solid border"
          >
            <Img
              src="/plural-logo-white.svg"
              width={24}
            />
            <TransitionText
              ml={1}
              mb="-4px"
              collapsed={collapsed}
            >
              <Img
                src="/plural-logotype-white.svg"
                height={20}
              />
            </TransitionText>
          </Flex>
        </Link>
        {/* ---
          MENU
        --- */}
        <Div
          py={0.75}
          px={0.75}
          flexGrow={1}
          flexShrink={1}
          overflowY="auto"
          overflowX="hidden"
          borderBottom="1px solid border"
          {...{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '&::-webkit-scrollbar-thumb': {
              display: 'none',
            },
          }}
        >
          {items.map(({
            name, Icon, url, urlRegexp,
          }) => (
            // @ts-expect-error
            <SidebarItem
              key={name}
              marginBottom="xsmall"
              active={activeId.startsWith(url) || urlRegexp?.test(activeId)}
              collapsed={collapsed}
              startIcon={<Icon />}
              label={name}
              tooltip={name}
              linkTo={url}
            />
          ))}
        </Div>
        {/* ---
          SOCIAL
        --- */}
        <Div
          py={0.75}
          px={0.75}
          flexShrink={0}
          borderBottom="1px solid border"
        >
          {/* @ts-expect-error */}
          <SidebarItem
            mb={0.25}
            collapsed={collapsed}
            startIcon={<DiscordIcon />}
            endIcon={(
              <ArrowTopRightIcon />
            )}
            label="Discord"
            tooltip="Discord"
            linkTo="https://discord.gg/pluralsh"
          />
          {/* @ts-expect-error */}
          <SidebarItem
            collapsed={collapsed}
            startIcon={<GitHubLogoIcon />}
            endIcon={(
              <ArrowTopRightIcon />
            )}
            label="GitHub"
            tooltip="GitHub"
            linkTo="https://github.com/pluralsh/plural"
          />
        </Div>
        {/* ---
          COLLAPSE
        --- */}
        <Div
          pt={0.75}
          px={0.75}
          flexShrink={0}
        >
          {/* @ts-expect-error */}
          <SidebarItem
            active={isNotificationsPanelOpen}
            collapsed={collapsed}
            startIcon={<BellIcon />}
            label="Notifications"
            tooltip="Notifications"
            onClick={event => {
              event.stopPropagation()
              setIsNotificationsPanelOpen(x => !x)
            }}
            badge={notificationsCount}
          />
        </Div>
        {/* ---
          USER
        --- */}
        <Div
          py={0.5}
          px={0.5}
          flexShrink={0}
        >
          {/* @ts-expect-error */}
          <SidebarItem
            ref={menuItemRef}
            py={0.25 / 2}
            px={0.5}
            active={isMenuOpen}
            collapsed={collapsed}
            startIcon={(
              <Avatar
                src={userImageUrl}
                name={userName}
                flexShrink={0}
                size={32}
              />
            )}
            label={(
              <Div>
                <Div
                  collapsed={collapsed}
                  color="text-strong"
                  fontWeight={500}
                  wordBreak="keep-all"
                >
                  {userName}
                </Div>
                {userAccount && (
                  <Div
                    body3
                    collapsed={collapsed}
                    color="text-xlight"
                    wordBreak="keep-all"
                  >
                    {userAccount}
                  </Div>
                )}
              </Div>
            )}
            onClick={() => setIsMenuOpened(x => !x)}
          />
        </Div>
      </Flex>
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
          zIndex={99999}
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
              <P subtitle2>
                Notifications
              </P>
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
              <NotificationsPanel closePanel={() => setIsNotificationsPanelOpen(false)} />
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
