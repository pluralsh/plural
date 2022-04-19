import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BotIcon,
  BrowserIcon,
  CreditCardIcon,
  FingerPrintIcon,
  IdIcon,
  InstalledIcon,
  InvoicesIcon,
  KeyPairIcon,
  ListIcon,
  LogoutIcon,
  MagnifyingGlassIcon,
  MessagesIcon,
  OAuthIcon,
  PadlockIcon,
  PeopleIcon,
  PersonIcon,
  Sidebar as PluralSidebar,
  ReloadIcon,
  ScrollIcon,
  SirenIcon,
  WebhooksIcon,
} from 'pluralsh-design-system'

import { getPreviousUserData, setPreviousUserData, setToken, wipeToken } from '../helpers/authentication'

import { CurrentUserContext } from './login/CurrentUser'

export const SIDEBAR_ICON_HEIGHT = '40px'
export const SIDEBAR_WIDTH = '200px'
export const SMALL_WIDTH = '60px'

function Sidebar() {
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

  return (
    <PluralSidebar
      items={[
        {
          name: 'Explore',
          Icon: MagnifyingGlassIcon,
          url: '/explore',
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
            },
            {
              name: 'Password',
              url: '/me/edit/pwd',
              Icon: PadlockIcon,
            },
            {
              name: 'Installations',
              url: '/me/edit/installations',
              Icon: InstalledIcon,
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
          Icon: PeopleIcon,
          url: '/upgrades',
        },
        {
          name: 'Incidents',
          Icon: SirenIcon,
          url: '/incidents',
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
        },
      ]}
      activeUrl={pathname}
      user={me}
    />
  )
}

export default Sidebar
