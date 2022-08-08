import { ResponsiveLayoutContentContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer } from 'components/layout/ResponsiveLayout'
import { Flex } from 'honorable'
import { Tab } from 'pluralsh-design-system'
import { Link, Outlet, useLocation } from 'react-router-dom'

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
      padding="16px"
      overflowY="hidden"
    >
      <ResponsiveLayoutSidenavContainer
        marginTop={90}
        width={240}
      >
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
      </ResponsiveLayoutSidenavContainer>
      <ResponsiveLayoutSpacer />
      <ResponsiveLayoutContentContainer paddingTop="large"><Outlet /></ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSpacer />
    </Flex>
  )
}
