import { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from '@emotion/styled'
import { A, Avatar, Div, Flex, Img, P, useTheme } from 'honorable'
import {
  ArrowTopRightIcon,
  BotIcon,
  BrowserIcon,
  CollapseIcon,
  CreditCardIcon,
  DashboardIcon,
  DownloadIcon,
  FingerPrintIcon,
  HamburgerMenuCollapseIcon,
  HamburgerMenuIcon,
  IdIcon,
  InstalledIcon,
  InvoicesIcon,
  KeyPairIcon,
  LifePreserverIcon,
  LightningIcon,
  ListIcon,
  LogoutIcon,
  MagnifyingGlassIcon,
  MessagesIcon,
  OAuthIcon,
  PadlockIcon,
  PeopleIcon,
  PersonIcon,
  ReloadIcon,
  ScrollIcon,
  SirenIcon,
  UpdatesIcon,
  WebhooksIcon,
} from 'pluralsh-design-system'

import { getPreviousUserData, setPreviousUserData, setToken, wipeToken } from '../../helpers/authentication'

import { CurrentUserContext } from '../login/CurrentUser'

import WithNotifications from './WithNotifications'
import WithApplicationUpdate from './WithApplicationUpdate'

export const SIDEBAR_ICON_HEIGHT = '40px'
export const SIDEBAR_WIDTH = '224px'
export const SMALL_WIDTH = '60px'

function SidebarWrapper() {
  const me = useContext(CurrentUserContext)
  const { pathname } = useLocation()
  const previousUserData = getPreviousUserData()

  function handleLogout() {
    wipeToken()
    window.location = '/'
  }

  function handlePreviousUserClick() {
    setToken(previousUserData.jwt)
    setPreviousUserData(null)
    window.location.reload()
  }

  const items = [
    {
      name: 'Explore',
      Icon: MagnifyingGlassIcon,
      url: '/explore',
      matchedUrl: /^(?!.*\/(explore|repositories|repository)(?:\/installed)).*\/(explore|repositories|repository)\/?.*/i,
    },
    {
      name: 'Installed',
      Icon: InstalledIcon,
      url: '/installed',
    },
    {
      name: 'User',
      Icon: PersonIcon,
      url: '/me/edit',
      items: [
        {
          name: 'User Attributes',
          url: '/me/edit/user',
          Icon: PersonIcon,
        },
        {
          name: 'Password',
          url: '/me/edit/pwd',
          Icon: PadlockIcon,
        },
        {
          name: 'Access Tokens',
          url: '/me/edit/tokens',
          Icon: FingerPrintIcon,
        },
        {
          name: 'Public Keys',
          url: '/me/edit/keys',
          Icon: KeyPairIcon,
        },
        {
          name: 'Eab Credentials',
          url: '/me/edit/credentials',
          Icon: IdIcon,
        },
        {
          name: 'Logout',
          Icon: LogoutIcon,
          onClick: handleLogout,
        },
        ...(previousUserData && previousUserData.me.id !== me.id ? [
          {
            name: `Log back as ${previousUserData.me.name}`,
            onClick: handlePreviousUserClick,
            Icon: ReloadIcon,
          },
        ] : []),
      ],
    },
    {
      name: 'Accounts',
      Icon: PeopleIcon,
      url: '/accounts/edit',
      items: [
        {
          name: 'Users',
          url: '/accounts/edit/users',
          Icon: PersonIcon,
        },
        {
          name: 'Invites',
          url: '/accounts/edit/invites',
          Icon: MessagesIcon,
        },
        {
          name: 'Service Accounts',
          url: '/accounts/edit/service-accounts',
          Icon: BotIcon,
        },
        {
          name: 'Groups',
          url: '/accounts/edit/groups',
          Icon: PeopleIcon,
        },
        {
          name: 'Roles',
          url: '/accounts/edit/roles',
          Icon: ScrollIcon,
        },
        {
          name: 'Domains',
          url: '/accounts/edit/domains',
          Icon: BrowserIcon,
        },
        {
          name: 'Payment Methods',
          url: '/accounts/edit/methods',
          Icon: CreditCardIcon,
        },
        {
          name: 'Invoices',
          url: '/accounts/edit/invoices',
          Icon: InvoicesIcon,
        },
        {
          name: 'OAuth Integrations',
          url: '/accounts/edit/integrations',
          Icon: OAuthIcon,
        },
      ],
    },
    {
      name: 'Upgrades',
      Icon: UpdatesIcon,
      url: '/upgrades',
    },
    {
      name: 'Incidents',
      Icon: SirenIcon,
      url: '/incidents',
      items: [
        {
          name: 'My incidents',
          url: '/incidents/all',
          Icon: SirenIcon,
        },
        {
          name: 'Responses',
          url: '/incidents/responses',
          Icon: LifePreserverIcon,
        },
      ],
    },
    {
      name: 'Integrations',
      Icon: WebhooksIcon,
      url: '/webhooks',
    },
    {
      name: 'Audits',
      Icon: ListIcon,
      url: '/audits',
      items: [
        {
          name: 'Audits',
          Icon: ListIcon,
          url: 'audits/table',
        },
        {
          name: 'Login',
          Icon: OAuthIcon,
          url: '/audits/logins',
        },
        {
          name: 'Geodistribution',
          Icon: DashboardIcon,
          url: '/audits/graph',
        },
      ],
    },
  ]

  return (
    <WithNotifications>
      {({ notificationsCount, toggleNotificationsPanel }) => (
        <WithApplicationUpdate>
          {({ reloadApplication, shouldReloadApplication }) => (
            <Sidebar
              items={items}
              activeUrl={pathname}
              notificationsCount={notificationsCount}
              onNotificationsClick={toggleNotificationsPanel}
              hasUpdate={shouldReloadApplication}
              onUpdateClick={reloadApplication}
              userName={me.name}
              userImageUrl={me.avatar}
              userAccount={me.account?.name}
              supportUrl="https://www.plural.sh/contact"
            />
          )}
        </WithApplicationUpdate>
      )}
    </WithNotifications>
  )
}

const StyledLink = styled(Link)`
  text-decoration: none;
`

const Item = styled(Flex)`
  flex-shrink: 0;
  height: 40px;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 150ms linear;

  & svg {
    flex-shrink: 0;
  }
`

function TransitionText({ collapsed, ...props }) {
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

const ChildrenContainer = styled(Div)`
  & > * {
    transform: ${({ deployed }) => deployed ? 'translate(0px, 0px)' : 'translate(-4px, -4px)'};
    opacity: ${({ deployed }) => deployed ? 1 : 0};
    visibility: ${({ deployed }) => deployed ? 'visible' : 'hidden'};
    transition: opacity ${({ deployed }) => deployed ? 500 : 200}ms ease ${({ deployed }) => deployed ? 0 : 0}ms, visibility 200ms linear, transform 300ms ease;
  }
`

function Sidebar({
  activeUrl = '',
  hasUpdate = false,
  items = [],
  notificationsCount = 0,
  onNotificationsClick = () => {},
  onUpdateClick = () => {},
  onUserClick = () => {},
  supportUrl,
  userImageUrl,
  userName,
  userAccount,
  ...props
}) {
  const activeItem = getItemForUrl(items, activeUrl)
  const activeId = getId(activeItem)
  const theme = useTheme()
  const sidebarRef = useRef()
  const sidebarTopRef = useRef()
  const sidebarBottomRef = useRef()
  const [collapsed, setCollapsed] = useState((activeItem?.items || []).length === 0)
  const [deployedId, setDeployedId] = useState(activeUrl ? activeId : null)
  const [deployedIdBeforeCollapse, setDeployedIdBeforeCollapse] = useState(deployedId)
  const [childrenHeights, setChildrenHeights] = useState({})
  const [sidebarContentMaxHeight, setSidebarcontentMaxHeight] = useState('100%')
  const [hovered, setHovered] = useState(null)

  const getTopLevelItem = useCallback(item => {
    if (!item) return null

    if (items.some(x => x === item)) return item

    const parent = items.find(x => Array.isArray(x.items) && x.items.some(y => y === item))

    if (parent) return parent

    return null
  }, [items])

  const handleCollapse = useCallback((nextCollapsed, deploy = true) => {
    if (nextCollapsed === collapsed) return

    setCollapsed(nextCollapsed)

    if (deploy) {
      if (nextCollapsed) {
        setDeployedIdBeforeCollapse(deployedId)
        setDeployedId(null)
      }
      else {
        setDeployedId(deployedIdBeforeCollapse)
      }
    }
  }, [collapsed, deployedId, deployedIdBeforeCollapse])

  const handleDeployItem = useCallback(item => {
    if (!item) return

    const parentOrItem = getTopLevelItem(item)
    const id = getId(parentOrItem)

    if (id === deployedId) return

    setDeployedId(id)

    const isTopLevel = items.some(x => x === item)
    const hasChildren = (item.items || []).length > 0

    handleCollapse(isTopLevel && !hasChildren, false)
    setDeployedIdBeforeCollapse(null)
  }, [items, deployedId, handleCollapse, getTopLevelItem])

  useEffect(() => {
    setContentHeight()

    window.addEventListener('resize', setContentHeight)

    return () => {
      window.removeEventListener('resize', setContentHeight)
    }
  }, [])

  useEffect(() => {
    const nextChildrenHeights = {}

    items
    .filter(({ items }) => Array.isArray(items) && items.length > 0)
    .forEach(item => {
      const id = getId(item)
      const element = document.getElementById(`sidebar-children-${id}`)
      const div = element.firstElementChild

      nextChildrenHeights[id] = div.clientHeight
    })

    setChildrenHeights(nextChildrenHeights)
  }, [items])

  useEffect(() => {
    handleDeployItem(activeItem)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUrl])

  function setContentHeight() {
    setSidebarcontentMaxHeight(`${sidebarRef.current.offsetHeight - sidebarBottomRef.current.offsetHeight - sidebarTopRef.current.offsetHeight}px`)
  }

  function getItemForUrl(items, url) {
    for (const item of items) {
      if (item.url === url || (item.matchedUrl instanceof RegExp && item.matchedUrl.test(url))) return item

      if (Array.isArray(item.items)) {
        const found = getItemForUrl(item.items, url)

        if (found) return found
      }
    }

    return null
  }

  function isDeployedWithActiveChild(item) {
    return activeId && item && Array.isArray(item.items) && item.items.some(x => getId(x) === activeId)
  }

  function isTopLevelItem(item) {
    return items.some(x => x === item)
  }

  function isTopLevelActive(item) {
    return isTopLevelItem(item) && isDeployedWithActiveChild(item)
  }

  function getId(item) {
    if (!item) return null

    return `${item.url}___@@@___${item.name}`
  }

  function renderItems(items, marginLeft = 0) {
    return items.map(item => {
      const id = getId(item)
      const { name, url, Icon, items, onClick } = item
      const hasChildren = Array.isArray(items) && items.length > 0
      const isActive = (collapsed && isTopLevelActive(item)) || activeId === id
      const isHovered = hovered === id

      const itemNode = (
        <Item
          theme={theme}
          align="center"
          mb={0.25}
          mr={1}
          ml={`${marginLeft}px`}
          pl="12px"
          color={isHovered || isActive ? 'text-strong' : 'text-light'}
          backgroundColor={isHovered || isActive ? 'background-light' : 'unset'}
          onClick={event => {
            handleDeployItem(item)
            if (typeof onClick === 'function') onClick(event)
          }}
          onMouseEnter={() => setHovered(id)}
          onMouseLeave={() => setHovered(null)}
        >
          {Icon ? (
            <Icon
              size={14}
              color={isHovered || isActive ? 'text-strong' : 'text-light'}
            />
          ) : (
            <span style={{ width: 14 }} />
          )}
          <TransitionText
            truncate
            collapsed={collapsed}
            body2
            ml={1}
          >
            {name}
          </TransitionText>
          {hasChildren && (
            <>
              <Div flexGrow={1} />
              <Flex
                align="center"
                justify="center"
                cursor="pointer"
                transform={`rotate(${deployedId === id ? 0 : 180}deg)`}
                opacity={collapsed ? 0 : 1}
                visibility={collapsed ? 'hidden' : 'visible'}
                transition={`opacity ${collapsed ? 200 : 500}ms ease ${collapsed ? 0 : 100}ms, visibility 200ms linear, transform 300ms ease`}
                flexShrink={0}
              >
                <CollapseIcon
                  color="text-xlight"
                  size={6}
                />
              </Flex>
              <Div width="16px" />
            </>
          )}
        </Item>
      )

      return (
        <Fragment key={id}>
          {url && !isDeployedWithActiveChild(item) ? wrapLink(itemNode, url) : itemNode}
          {hasChildren && (
            <ChildrenContainer
              id={`sidebar-children-${id}`}
              deployed={deployedId === id}
              height={deployedId === id ? childrenHeights[id] || 0 : 0}
              overflow="hidden"
              transition="height 300ms ease"
              flexShrink={0}
            >
              <div>
                {renderItems(items, marginLeft + 12)}
              </div>
            </ChildrenContainer>
          )}
        </Fragment>
      )
    })
  }

  function wrapLink(node, url) {
    return (
      <StyledLink to={url}>
        {node}
      </StyledLink>
    )
  }

  const MenuIcon = collapsed ? HamburgerMenuIcon : HamburgerMenuCollapseIcon

  return (
    <Div
      ref={sidebarRef}
      transition="width 300ms ease"
      width={collapsed ? 74 : 256 - 32}
      height="100%"
      maxHeight="100%"
      overflow="hidden"
      borderRight="1px solid border"
      flexGrow={0}
      flexShrink={0}
      userSelect="none"
      {...props}
    >
      <Div ref={sidebarTopRef}>
        <Link to="/">
          <Flex
            py={1}
            pl={1.5}
            flexShrink={0}
            align="center"
            borderBottom="1px solid border"
          >
            <Img
              src="/plural-logo-white.svg"
              width={24}
            />
            <TransitionText
              ml={0.75}
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
        <Div
          pb={0.5}
          borderBottom="1px solid border"
        >
          <Item
            theme={theme}
            align="center"
            mt={0.5}
            mx={1}
            pl="12px"
            color="warning.200"
            onClick={onNotificationsClick}
          >
            <Div
              position="relative"
              flexShrink={0}
              mb={-0.25}
            >
              <LightningIcon
                width={16}
                color="warning.200"
              />
              {notificationsCount > 0 && (
                <Div
                  position="absolute"
                  top={-8}
                  right={-8}
                  backgroundColor="error"
                  color="white"
                  width={12}
                  height={12}
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={10}
                >
                  {notificationsCount}
                </Div>
              )}
            </Div>
            <TransitionText
              ml={1}
              collapsed={collapsed}
            >
              Notifications
            </TransitionText>
          </Item>
          {!!hasUpdate && (
            <Item
              theme={theme}
              align="center"
              mx={1}
              pl="12px"
              color="warning.200"
              onClick={onUpdateClick}
            >
              <DownloadIcon
                width={16}
                color="warning.200"
              />
              <TransitionText
                ml={1}
                collapsed={collapsed}
              >
                Update
              </TransitionText>
            </Item>
          )}
        </Div>
      </Div>
      <Div
        py={0.5}
        pl={1}
        flexGrow={1}
        flexShrink={1}
        overflowY="auto"
        height={sidebarContentMaxHeight}
        maxHeight={sidebarContentMaxHeight}
        {...{
          '&::-webkit-scrollbar': {
            backgroundColor: 'background',
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'text-xlight',
            borderRadius: 4,
            display: collapsed ? 'none' : null,
          },
        }}
      >
        <Div id="sidebar-items">
          {renderItems(items)}
        </Div>
      </Div>
      <Div
        ref={sidebarBottomRef}
        flexGrow={0}
        flexShrink={0}
      >
        <Hoverer>
          {hovered => (
            <A
              href={supportUrl}
              target="_blank"
              borderBottom="1px solid border"
              display="block"
              _hover={{ textDecoration: 'none' }}
            >
              <Flex
                py={1}
                pl={1.75}
                align="center"
                overflow="hidden"
                cursor="pointer"
              >
                <LifePreserverIcon
                  size={16}
                  flexShrink={0}
                  color={hovered ? 'text-strong' : 'text-xlight'}
                />
                <TransitionText
                  collapsed={collapsed}
                  ml={1.75}
                  body2
                  flexGrow={1}
                  color={hovered ? 'text-strong' : 'text-xlight'}
                >
                  Support
                </TransitionText>
                <TransitionText
                  collapsed={collapsed}
                  ml={1}
                  mr={1}
                  flexShrink={0}
                  mb={-0.25}
                >
                  <ArrowTopRightIcon
                    size={22}
                    color={hovered ? 'text-strong' : 'text-xlight'}
                  />
                </TransitionText>
              </Flex>
            </A>
          )}
        </Hoverer>
        <Hoverer>
          {hovered => (
            <Flex
              py={1}
              pl={1.75}
              align="center"
              overflow="hidden"
              cursor="pointer"
              borderBottom="1px solid border"
              onClick={() => handleCollapse(!collapsed)}
            >
              <MenuIcon
                size={16}
                flexShrink={0}
                color={hovered ? 'text-strong' : 'text-xlight'}
              />
              <TransitionText
                collapsed={collapsed}
                ml={1.75}
                body2
                color={hovered ? 'text-strong' : 'text-xlight'}
              >
                Collapse
              </TransitionText>
            </Flex>
          )}
        </Hoverer>
        <Flex
          py={1}
          pl={1}
          align="center"
          cursor="pointer"
          onClick={onUserClick}
        >
          <Avatar
            src={userImageUrl}
            name={userName}
            flexShrink={0}
          />
          <Div
            ml={1}
            flexShrink={0}
          >
            <TransitionText
              collapsed={collapsed}
              color="text-strong"
              fontWeight={500}
              wordBreak="keep-all"
            >
              {userName}
            </TransitionText>
            {userAccount && (
              <TransitionText
                mt={0.25}
                body3
                collapsed={collapsed}
                color="text-xlight"
                wordBreak="keep-all"
              >
                {userAccount}
              </TransitionText>
            )}
          </Div>
        </Flex>
      </Div>
    </Div>
  )
}

function Hoverer({ children }) {
  const rootRef = useRef()
  const [hovered, setHovered] = useState(false)

  return (
    <Div
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children(hovered)}
    </Div>
  )
}

export default SidebarWrapper
