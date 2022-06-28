import { Div, Flex } from 'honorable'
import { Tab } from 'pluralsh-design-system'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { SidebarTabs } from '../utils/SidebarTabs'

const DIRECTORY = [
  { path: '/account/edit', label: 'Account Settings' },
  { path: '/account/users', label: 'Users' },
  { path: '/account/service-accounts', label: 'Service Accounts' },
  { path: '/account/groups', label: 'Groups' },
  { path: '/account/roles', label: 'Roles' },
  { path: '/account/domains', label: 'Domains' },
]

export function Account() {
  const { pathname } = useLocation()

  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
    >
      <SidebarTabs>
        {DIRECTORY.map(({ label, path }) => (
          <Link
            to={path}
            style={{ textDecoration: 'none' }}
          >
            <Tab
              active={pathname === path}
              vertical
              textDecoration="none"
            >{label}
            </Tab>
          </Link>
        ))}
      </SidebarTabs>
      <Div
        flexGrow={1}
        pt={1.5}
        pr={1.5}
        height="100%"
        maxHeight="100%"
        overflowY="auto"
      >
        <Outlet />
      </Div>
    </Flex>
  )
}
