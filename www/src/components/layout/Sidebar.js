import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BotIcon,
  BrowserIcon,
  CreditCardIcon,
  DashboardIcon,
  FingerPrintIcon,
  IdIcon,
  InstalledIcon,
  InvoicesIcon,
  KeyPairIcon,
  LifePreserverIcon,
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
            <PluralSidebar
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

export default Sidebar
