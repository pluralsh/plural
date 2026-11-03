import {
  Avatar,
  ClusterIcon,
  CookieIcon,
  CreditCardIcon,
  Flex,
  HelpIcon,
  ListIcon,
  LogoutIcon,
  PeopleIcon,
  PersonIcon,
  Tooltip,
  WrapWithIf,
} from '@pluralsh/design-system'
import {
  ReactElement,
  use,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { useLogoutMutation } from '../../generated/graphql'
import { getPreviousUserData } from '../../helpers/authentication'
import { clearLocalStorage } from '../../helpers/localStorage'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import Cookiebot from '../../utils/cookiebot'
import BillingSubscriptionChip from '../account/billing/BillingSubscriptionChip'
import { handlePreviousUserClick } from '../login/CurrentUser'

import {
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_WIDTH,
  SidebarContext,
  SidebarProvider,
} from './sidebar/SidebarContext'
import {
  SidebarItem,
  sidebarItemFills,
  sidebarItemLayout,
} from './sidebar/SidebarItem'
import { SidebarSection } from './sidebar/SidebarSection'

const CONSOLE_LOGO_LIGHT = '/console-logo.png'
const CONSOLE_LOGO_DARK = '/console-logo-white.png'

type MenuItem = {
  text: string
  icon: ReactElement
  path: string
  pathRegexp?: RegExp
}

function isActiveMenuItem({ path, pathRegexp }: MenuItem, pathname: string) {
  if (pathRegexp) return pathRegexp.test(pathname)

  return path === '/' ? pathname === path : pathname.startsWith(path)
}

export default function Sidebar() {
  return (
    <SidebarProvider>
      <SidebarContent />
    </SidebarProvider>
  )
}

function SidebarContent() {
  const theme = useTheme()
  const { isExpanded, setIsExpanded } = use(SidebarContext)
  const { pathname } = useLocation()

  const menuItems: MenuItem[] = [
    {
      text: 'Home',
      icon: (
        <SidebarLogoSC
          src={theme.mode === 'light' ? CONSOLE_LOGO_LIGHT : CONSOLE_LOGO_DARK}
          alt="Plural Cloud"
        />
      ),
      path: '/',
    },
    {
      text: 'Control planes',
      icon: <ClusterIcon />,
      path: '/overview',
      pathRegexp: /^\/(overview|clusters|apps|create-cluster)/,
    },
    { text: 'Audits', icon: <ListIcon />, path: '/audits' },
    {
      text: 'Organization',
      icon: <PeopleIcon />,
      path: '/account',
      pathRegexp: /^\/account(?!\/billing)(\/.*)?$/,
    },
    {
      text: 'Billing',
      icon: <CreditCardIcon />,
      path: '/account/billing',
      pathRegexp: /^\/account\/billing(\/.*)?$/,
    },
  ]

  return (
    <SidebarSC $isExpanded={isExpanded}>
      <SidebarSection grow={1}>
        {menuItems.map((item) => (
          <SidebarItem
            asLink
            key={item.path}
            to={item.path}
            data-phid={`sidebar-item-${item.text.replace(/\s/g, '').toLowerCase()}`}
            tooltip={item.text}
            expandedLabel={item.text}
            active={isActiveMenuItem(item, pathname)}
          >
            {item.icon}
          </SidebarItem>
        ))}
        <Flex grow={1} />
        <SidebarItem
          onClick={() =>
            window.open('https://docs.plural.sh', '_blank', 'noopener')
          }
          tooltip="Help and docs"
          expandedLabel="Help and docs"
        >
          <HelpIcon />
        </SidebarItem>
        <ProfileMenu />
      </SidebarSection>
      <ToggleRowSC>
        <WrapWithIf
          condition={!isExpanded}
          wrapper={
            <Tooltip
              label="Expand sidebar"
              placement="right"
              css={{ whiteSpace: 'nowrap' }}
            />
          }
        >
          <ToggleButtonSC
            type="button"
            $isExpanded={isExpanded}
            aria-label={isExpanded ? undefined : 'Expand sidebar'}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded((expanded) => !expanded)
            }}
          >
            <ToggleChevronIcon direction={isExpanded ? 'left' : 'right'} />
            {isExpanded ? 'Collapse' : null}
          </ToggleButtonSC>
        </WrapWithIf>
      </ToggleRowSC>
    </SidebarSC>
  )
}

function ProfileMenu() {
  const theme = useTheme()
  const me = useContext(CurrentUserContext)
  const { isExpanded } = use(SidebarContext)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const previousUser = getPreviousUserData()
  const [logoutMutation] = useLogoutMutation()
  const close = useCallback(() => setIsOpen(false), [])

  useOutsideClick(ref, close)

  const handleLogout = () => {
    logoutMutation()
      .catch(() => undefined)
      .finally(() => {
        clearLocalStorage()
        ;(window as Window).location = '/'
      })
  }

  if (!me) return null

  return (
    <ProfileWrapperSC
      ref={ref}
      $isExpanded={isExpanded}
    >
      <WrapWithIf
        condition={!isExpanded && !isOpen}
        wrapper={
          <Tooltip
            label="Profile"
            placement="right"
            css={{ whiteSpace: 'nowrap' }}
          />
        }
      >
        <ProfileButtonSC
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Open profile menu"
          $isExpanded={isExpanded}
          $isOpen={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Avatar
            name={me.name ?? undefined}
            src={me.avatar ?? undefined}
            size={24}
            css={{
              flexShrink: 0,
              ...(!me.avatar && {
                backgroundColor: theme.colors['fill-three'],
                border: theme.borders.input,
                fontSize: '0.625rem',
                ...(theme.mode === 'light' && { color: theme.colors.text }),
              }),
            }}
          />
          {isExpanded && <span className="name">{me.name}</span>}
        </ProfileButtonSC>
      </WrapWithIf>
      {isOpen && (
        <MenuSC role="menu">
          <MenuIdentitySC>
            <span className="name">{me.name}</span>
            <span className="email">{me.email}</span>
          </MenuIdentitySC>
          <MenuDividerSC />
          <MenuItemSC
            as={Link}
            to="/profile"
            onClick={close}
          >
            <PersonIcon size={16} />
            My profile
          </MenuItemSC>
          <MenuItemSC
            as={Link}
            to="/account/edit"
            onClick={close}
          >
            <PeopleIcon size={16} />
            <MenuOrgLabelSC>
              Organization
              {me.account?.name && (
                <MenuSecondaryTextSC>{me.account.name}</MenuSecondaryTextSC>
              )}
            </MenuOrgLabelSC>
            <BillingSubscriptionChip
              size="small"
              asLink={false}
            />
          </MenuItemSC>
          <MenuDividerSC />
          {Cookiebot?.consent?.necessary && (
            <MenuItemSC
              type="button"
              onClick={() => Cookiebot?.show()}
            >
              <CookieIcon size={16} />
              Cookie settings
            </MenuItemSC>
          )}
          {previousUser && (
            <MenuItemSC
              type="button"
              onClick={() => handlePreviousUserClick(previousUser)}
            >
              <LogoutIcon size={16} />
              Switch back
            </MenuItemSC>
          )}
          <MenuDividerSC />
          <MenuItemSC
            type="button"
            onClick={handleLogout}
          >
            <LogoutIcon size={16} />
            Logout
          </MenuItemSC>
        </MenuSC>
      )}
    </ProfileWrapperSC>
  )
}

function ToggleChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const { colors } = useTheme()
  const color = colors['icon-xlight']

  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
    >
      <rect
        x={0.5}
        y={0.5}
        width={15}
        height={15}
        rx={3}
        stroke={color}
      />
      <path
        d={
          direction === 'left'
            ? 'M8.65332 3.80762L4.90332 7.55762L4.46191 8L4.90332 8.44238L8.65332 12.1924L9.53809 11.3076L6.23047 8L9.53809 4.69238L8.65332 3.80762Z'
            : 'M7.34668 12.1924L11.0967 8.44238L11.5381 8L11.0967 7.55762L7.34668 3.80762L6.46191 4.69238L9.76953 8L6.46191 11.3076L7.34668 12.1924Z'
        }
        fill={color}
      />
    </svg>
  )
}

const SidebarSC = styled.nav<{ $isExpanded: boolean }>(
  ({ theme, $isExpanded }) => {
    const width = $isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_WIDTH

    return {
      position: 'relative',
      zIndex: theme.zIndexes.base + 1,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100%',
      transition: 'width 0.2s ease-in-out',
      width,
      minWidth: width,
      maxWidth: width,
      backgroundColor: theme.colors['fill-accent'],
      borderRight: theme.borders.default,
    }
  }
)

const SidebarLogoSC = styled.img({
  width: 24,
  height: 24,
  objectFit: 'contain',
  margin: '0 -4px',
})

const ToggleRowSC = styled.div({ height: 40, width: '100%' })

const ToggleButtonSC = styled.button<{ $isExpanded: boolean }>(
  ({ theme, $isExpanded }) => ({
    ...theme.partials.reset.button,
    ...theme.partials.text.body2,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: $isExpanded ? 'flex-start' : 'center',
    gap: theme.spacing.xsmall,
    padding: $isExpanded ? `0 ${theme.spacing.medium}` : theme.spacing.small,
    whiteSpace: 'nowrap',
    color: theme.colors['text-xlight'],
    cursor: 'pointer',
    '&:hover': { background: sidebarItemFills(theme).hover },
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
  })
)

const ProfileWrapperSC = styled.div<{ $isExpanded: boolean }>(
  ({ $isExpanded }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignSelf: $isExpanded ? 'stretch' : 'center',
  })
)

const ProfileButtonSC = styled.button<{
  $isExpanded: boolean
  $isOpen: boolean
}>(({ theme, $isExpanded, $isOpen }) => {
  const fills = sidebarItemFills(theme)

  return {
    ...theme.partials.reset.button,
    ...theme.partials.text.body2,
    ...sidebarItemLayout(theme, $isExpanded),
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: $isExpanded ? 'flex-start' : 'center',
    gap: theme.spacing.small,
    borderRadius: theme.borderRadiuses.medium,
    color: theme.colors['text-light'],
    cursor: 'pointer',
    background: $isOpen ? fills.selected : 'transparent',
    '&:hover': { background: fills.hover },
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
    '.name': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }
})

const MenuSC = styled.div(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: `calc(100% + ${theme.spacing.medium} + ${theme.spacing.xsmall})`,
  zIndex: theme.zIndexes.modal,
  width: 260,
  padding: theme.spacing.xxsmall,
  background: theme.colors['fill-two'],
  border: theme.borders['fill-two'],
  borderRadius: theme.borderRadiuses.large,
  boxShadow: theme.boxShadows.modal,
  display: 'flex',
  flexDirection: 'column',
}))

const MenuItemSC = styled.button(({ theme }) => ({
  ...theme.partials.reset.button,
  ...theme.partials.text.body2,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.small,
  padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
  borderRadius: theme.borderRadiuses.medium,
  color: theme.colors.text,
  textDecoration: 'none',
  cursor: 'pointer',
  '&:hover': { background: theme.colors['fill-two-hover'] },
}))

const MenuIdentitySC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xxxsmall,
  padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
  minWidth: 0,
  '.name': { ...theme.partials.text.body2Bold, color: theme.colors.text },
  '.email': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}))

const MenuOrgLabelSC = styled.span({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
})

const MenuSecondaryTextSC = styled.span(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

const MenuDividerSC = styled.div(({ theme }) => ({
  height: 1,
  margin: `${theme.spacing.xxsmall} 0`,
  background: theme.colors['border-fill-two'],
}))
