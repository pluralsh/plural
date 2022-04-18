import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FingerPrintIcon,
  IdIcon,
  InstalledIcon,
  KeyPairIcon,
  ListIcon,
  LogoutIcon,
  MagnifyingGlassIcon,
  PadlockIcon,
  PeopleIcon,
  PersonIcon,
  Sidebar as PluralSidebar,
  ReloadIcon,
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
              Icon: () => ( // TODO in design-system
                <span style={{ width: 14 }} />
              ),
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
