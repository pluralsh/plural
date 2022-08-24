import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from 'components/layout/ResponsiveLayout'
import { Flex } from 'honorable'
import { Tab, TabList, TabPanel } from 'pluralsh-design-system'
import { useRef } from 'react'

import { Outlet, useLocation } from 'react-router-dom'

import { LinkTabWrap } from '../utils/Tabs'

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
  const tabStateRef = useRef<any>()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
      padding={32}
      paddingTop={88}
    >
      <ResponsiveLayoutSidenavContainer width={240}>
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
      <TabPanel
        as={<ResponsiveLayoutContentContainer />}
        stateRef={tabStateRef}
      >
        <Outlet />
      </TabPanel>
      <ResponsiveLayoutSpacer />
      <ResponsiveLayoutSidecarContainer width="200px" />
    </Flex>
  )
}
