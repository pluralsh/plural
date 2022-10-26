import { ResponsiveLayoutContentContainer, ResponsiveLayoutSidenavContainer, ResponsiveLayoutSpacer } from 'components/layout/ResponsiveLayout'
import { Flex } from 'honorable'
import { Tab, TabList } from 'pluralsh-design-system'
import { Outlet, useLocation } from 'react-router-dom'
import { useRef } from 'react'

import { LinkTabWrap } from '../utils/Tabs'

const DIRECTORY = [
  { path: '/audits/logs', label: 'Audit logs' },
  { path: '/audits/logins', label: 'Logins' },
  { path: '/audits/geo', label: 'Geodistribution' },
]

export function AuditDirectory() {
  const { pathname } = useLocation()
  const tabStateRef = useRef()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

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
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'vertical',
            selectedKey: currentTab?.path,
          }}
        >
          {DIRECTORY.map(({ label, path }) => (
            <LinkTabWrap
              key={path}
              textValue={label}
              to={path}
            >
              <Tab>{label}</Tab>
            </LinkTabWrap>
          ))}
        </TabList>
      </ResponsiveLayoutSidenavContainer>
      <ResponsiveLayoutSpacer />
      <ResponsiveLayoutContentContainer paddingTop="large">
        <Outlet />
      </ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSpacer />
    </Flex>
  )
}
