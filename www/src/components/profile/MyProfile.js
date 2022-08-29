import { Flex } from 'honorable'
import {
  PageCard, Tab, TabList, TabPanel,
} from 'pluralsh-design-system'
import { Outlet, useLocation } from 'react-router-dom'

import { useContext, useRef } from 'react'

import { LinkTabWrap } from '../utils/Tabs'

import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from '../layout/ResponsiveLayout'
import { CurrentUserContext } from '../login/CurrentUser'

const DIRECTORY = [
  { path: '/profile/me', label: 'Profile' },
  { path: '/profile/security', label: 'Security' },
  { path: '/profile/tokens', label: 'Access tokens' },
  { path: '/profile/keys', label: 'Public keys' },
  { path: '/profile/eab', label: 'EAB credentials' },
]

export function MyProfile() {
  const me = useContext(CurrentUserContext)
  const { pathname } = useLocation()
  const tabStateRef = useRef()
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
        <PageCard
          heading={me.name}
          icon={{ name: me.avatar, url: me.avatar, spacing: 'none' }}
          subheading={me?.roles?.admin && (
            `Admin${me?.account?.name && ` at ${me?.account?.name}`}`
          )}
          marginBottom="xlarge"
        />
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
    </Flex>
  )
}
