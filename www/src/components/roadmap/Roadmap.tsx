import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Flex } from 'honorable'
import { Tab, TabList } from '@pluralsh/design-system'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'
import { LinkTabWrap } from '../utils/Tabs'

import RoadmapDataProvider from './RoadmapDataProvider'

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

  return (
    <Flex marginTop="xxxxlarge">
      <ResponsiveLayoutSidenavContainer
        marginLeft="medium"
        width={240}
      >
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'vertical',
            selectedKey: pathname,
          }}
        >
          {TABS.map(({ label, path }) => (
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
      <ResponsiveLayoutContentContainer>
        <RoadmapDataProvider>
          <Outlet />
        </RoadmapDataProvider>
      </ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSidecarContainer>
        Sidecar
      </ResponsiveLayoutSidecarContainer>
      <ResponsiveLayoutSpacer />
    </Flex>
  )
}

export default Roadmap
