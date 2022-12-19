import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Div, Flex } from 'honorable'
import { Tab, TabList } from '@pluralsh/design-system'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'
import { LinkTabWrap } from '../utils/Tabs'

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

  return (
    <Flex
      paddingTop="xxxxlarge"
      position="relative"
      height="100vh"
    >
      <ResponsiveLayoutSidenavContainer
        marginLeft="medium"
        marginTop="xxxlarge"
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
        <Div
          maxHeight="100%"
          overflow="hidden"
        >
          <RoadmapDataProvider>
            <Outlet />
          </RoadmapDataProvider>
        </Div>
      </ResponsiveLayoutContentContainer>
      <ResponsiveLayoutSidecarContainer marginTop="xsmall">
        <RoadmapSideCar />
      </ResponsiveLayoutSidecarContainer>
      <ResponsiveLayoutSpacer />
    </Flex>
  )
}

export default Roadmap
