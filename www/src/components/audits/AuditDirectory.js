import { Div, Flex } from 'honorable'
import { Tab } from 'pluralsh-design-system'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { Container } from '../utils/Container'

import { SidebarTabs } from '../utils/SidebarTabs'

const DIRECTORY = [
  { path: '/audits/logs', label: 'Audit logs' },
  { path: '/audits/logins', label: 'Logins' },
  { path: '/audits/geo', label: 'Geodistribution' },
]

export function AuditDirectory() {
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
            key={label}
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
        py={1.5}
        pr={1.5}
        height="100%"
        maxHeight="100%"
        overflowY="auto"
      >
        <Container type="table">
          <Outlet />
        </Container>
      </Div>
    </Flex>
  )
}
