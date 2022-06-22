import { Div, Flex } from 'honorable'
import { Tab } from 'pluralsh-design-system'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { SidebarTabs } from '../utils/SidebarTabs'

const DIRECTORY = [
  { path: '/profile/me', label: 'Profile' },
  { path: '/profile/security', label: 'Security & Privacy' },
  { path: '/profile/tokens', label: 'Access Tokens' },
  { path: '/profile/keys', label: 'Public Keys' },
  { path: '/profile/eab', label: 'EAB Credentials' },
]

export function MyProfile() {
  const { pathname } = useLocation()

  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
    >
      <SidebarTabs width={300}>
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
        px={2}
        height="100%"
        maxHeight="100%"
        overflowY="auto"
      >
        <Outlet />
      </Div>
    </Flex>
  )
}
