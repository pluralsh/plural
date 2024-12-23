import { useMemo, useRef } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Div } from 'honorable'
import { Tab, TabList, useSetBreadcrumbs } from '@pluralsh/design-system'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import { LinkTabWrap } from '../utils/Tabs'

import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

import { SideNavOffset } from '../utils/layout/SideNavOffset'

import RoadmapDataProvider from './RoadmapDataProvider'
import RoadmapSideCar from './RoadmapSideCar'

const TABS = [
  {
    label: 'Roadmap',
    path: '/roadmap',
  },
  {
    label: 'Changelog',
    path: '/roadmap/changelog',
  },
  {
    label: 'Application requests',
    path: '/roadmap/application-requests',
  },
  {
    label: 'Feature requests',
    path: '/roadmap/feature-requests',
  },
  {
    label: 'Feedback',
    path: '/roadmap/feedback',
  },
]

function Roadmap() {
  const tabStateRef = useRef<any>()
  const { pathname } = useLocation()

  const params = useParams()
  const subPath = params?.['*']?.split?.('/')[0]
  const breadcrumbs = useMemo(
    () => [
      { label: 'roadmap', url: '/roadmap' },
      ...(subPath
        ? [
            {
              label: subPath,
              url: `/roadmap/${subPath}`,
            },
          ]
        : []),
    ],
    [subPath]
  )

  useSetBreadcrumbs(breadcrumbs)

  return (
    <ResponsiveLayoutPage>
      <ResponsiveLayoutSidenavContainer>
        <SideNavOffset paddingTop={60}>
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'vertical',
              selectedKey: pathname,
            }}
          >
            {TABS.map(({ label, path }) => (
              <LinkTabWrap
                vertical
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
      <ResponsiveLayoutContentContainer marginRight-desktop-down={32}>
        <Div
          flexGrow={1}
          maxHeight="100%"
          overflow="hidden"
        >
          <RoadmapDataProvider>
            <Outlet />
          </RoadmapDataProvider>
        </Div>
      </ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSidecarContainer marginTop="minus-medium">
        <RoadmapSideCar />
      </ResponsiveLayoutSidecarContainer>
      <ResponsiveLayoutSpacer />
    </ResponsiveLayoutPage>
  )
}

export default Roadmap
