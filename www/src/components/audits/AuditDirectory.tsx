import { Tab, TabList } from '@pluralsh/design-system'
import { Outlet, useLocation } from 'react-router-dom'
import { useRef } from 'react'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'

import { LinkTabWrap } from '../utils/Tabs'
import { SideNavOffset } from '../utils/layout/SideNavOffset'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

const DIRECTORY = [
  { path: '/audits/logs', label: 'Audit logs' },
  { path: '/audits/logins', label: 'Logins' },
  { path: '/audits/geo', label: 'Geodistribution' },
]

export function AuditDirectory() {
  const { pathname } = useLocation()
  const tabStateRef = useRef<any>(null)
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <ResponsiveLayoutPage>
      <ResponsiveLayoutSidenavContainer>
        <SideNavOffset paddingTop={66}>
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
        </SideNavOffset>
      </ResponsiveLayoutSidenavContainer>
      <ResponsiveLayoutSpacer />
      <ResponsiveLayoutContentContainer>
        <Outlet />
      </ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSpacer />
    </ResponsiveLayoutPage>
  )
}
