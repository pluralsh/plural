import { Tab, TabList, useSetBreadcrumbs } from '@pluralsh/design-system'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { useMemo, useRef } from 'react'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'

import { LinkTabWrap } from '../utils/Tabs'
import { SideNavOffset } from '../utils/layout/SideNavOffset'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'

const DIRECTORY = [
  { path: '/audits/logs', label: 'Audit logs' },
  { path: '/audits/logins', label: 'Logins' },
  { path: '/audits/geo', label: 'Geodistribution' },
]

export function AuditDirectory() {
  const { pathname } = useLocation()
  const tabStateRef = useRef<any>(null)
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  const params = useParams()
  const subPath = params?.['*']?.split?.('/')[0]
  const breadcrumbs = useMemo(() => [
    {
      label: 'audits',
      url: '/audits',
    },
    ...(subPath
      ? [
        {
          label: subPath,
          url: `/audits/${subPath}`,
        },
      ]
      : []),
  ],
  [subPath])

  useSetBreadcrumbs(breadcrumbs)

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
      <ResponsiveLayoutSidecarContainer width={200} />
      <ResponsiveLayoutSpacer />
    </ResponsiveLayoutPage>
  )
}
