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
  MarketIcon,
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
      name: 'Applications',
      Icon: MarketIcon,
      url: '/applications',
      matchedUrl: /^\/(applications|installed|repository)/i,
    },
    {
      name: 'Accounts',
      Icon: PeopleIcon,
      url: '/accounts',
    },
    {
      name: 'Upgrades',
      Icon: UpdatesIcon,
      url: '/upgrades',
    },
    // {
    //   name: 'Incidents',
    //   Icon: SirenIcon,
    //   url: '/incidents',
    //   items: [
    //     {
    //       name: 'My incidents',
    //       url: '/incidents/all',
    //       Icon: SirenIcon,
    //     },
    //     {
    //       name: 'Responses',
    //       url: '/incidents/responses',
    //       Icon: LifePreserverIcon,
    //     },
    //   ],
    // },
    // {
    //   name: 'Integrations',
    //   Icon: WebhooksIcon,
    //   url: '/webhooks',
    // },
    {
      name: 'Audits',
      Icon: ListIcon,
      url: '/audits',
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
            />
          )}
        </WithApplicationUpdate>
      )}
    </WithNotifications>
  )
}

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

function Sidebar({
  activeUrl = '',
  hasUpdate = false,
  items = [],
  notificationsCount = 0,
  onNotificationsClick = () => {},
  onUpdateClick = () => {},
  onUserClick = () => {},
  userImageUrl,
  userName,
  userAccount,
  ...props
}) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <Flex
      direction="column"
      flexGrow={0}
      flexShrink={0}
      width={collapsed ? 74 : 256 - 32}
      height="100vh"
      maxHeight="100vh"
      borderRight="1px solid border"
      overflow="hidden"
      userSelect="none"
      transition="width 300ms ease"
      {...props}
    >
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
      {/* <Div
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
      </Div> */}
      {/* <Div
        py={0.5}
        pl={1}
        flexGrow={1}
        flexShrink={1}
        overflowY="auto"
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
      </Div> */}
      {/* <Div
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
        </Hoverer> */}
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
    </Flex>
  )
}

export default SidebarWrapper
