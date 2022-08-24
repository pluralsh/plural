import { Flex } from 'honorable'
import { Tab, TabList, TabPanel } from 'pluralsh-design-system'
import { Outlet, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useRef } from 'react'

import { SidebarTabs } from '../utils/SidebarTabs'
import { LinkTabWrap } from '../utils/Tabs'

const DIRECTORY = [
  { path: '/account/edit', label: 'Account Settings' },
  { path: '/account/users', label: 'Users' },
  { path: '/account/service-accounts', label: 'Service Accounts' },
  { path: '/account/groups', label: 'Groups' },
  { path: '/account/roles', label: 'Roles' },
  { path: '/account/domains', label: 'Domains' },
]

const StyledTabPanel = styled(TabPanel)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: theme.spacing.large,
  paddingRight: theme.spacing.large,
  height: '100%',
  maxHeight: '100%',
  overflowY: 'auto',
  textDecoration: 'none',
  width: '100%',
}))

export function Account() {
  const { pathname } = useLocation()
  const tabStateRef = useRef()
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
    >
      <SidebarTabs>
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
      </SidebarTabs>
      <StyledTabPanel stateRef={tabStateRef}>
        <Outlet />
      </StyledTabPanel>
    </Flex>
  )
}
