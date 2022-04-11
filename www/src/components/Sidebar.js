import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import {
  InstalledIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PeopleIcon,
  PersonIcon,
  Sidebar as PluralSidebar,
  SirenIcon,
  WebhooksIcon,
} from 'pluralsh-design-system'

import { CurrentUserContext } from './login/CurrentUser'

console.log(
  InstalledIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PeopleIcon,
  PersonIcon,
  PluralSidebar,
  SirenIcon,
  WebhooksIcon
)

const items = [
  { name: 'Explore',
    Icon: MagnifyingGlassIcon,
    url: '/explore',
  },
  { name: 'Installed',
    Icon: InstalledIcon,
    url: '/installed',
  },
  { name: 'User',
    Icon: PersonIcon,
    url: '/me/edit',
  },
  { name: 'Accounts',
    Icon: PeopleIcon,
    url: '/accounts/edit',
  },
  { name: 'Upgrades',
    Icon: PeopleIcon,
    url: '/upgrades',
  },
  { name: 'Incidents',
    Icon: SirenIcon,
    url: '/incidents',
  },
  { name: 'Integrations',
    Icon: WebhooksIcon,
    url: '/webhooks',
  },
  { name: 'Audits',
    Icon: ListIcon,
    url: '/audits',
  },
]

function Sidebar() {
  const me = useContext(CurrentUserContext)
  const { pathname } = useLocation()

  return (
    <PluralSidebar
      items={items}
      activeUrl={pathname}
      user={me}
    />
  )
}

export const SIDEBAR_ICON_HEIGHT = '16px'
export const SIDEBAR_WIDTH = '208px'
export const SMALL_WIDTH = '16px'

export default Sidebar
