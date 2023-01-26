import {
  PageCard,
  Tab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { Outlet, useLocation } from 'react-router-dom'

import { useContext, useRef } from 'react'

import { LinkTabWrap } from '../utils/Tabs'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'
import { SideNavOffset } from '../utils/layout/SideNavOffset'

const DIRECTORY = [
  { path: '/profile/me', label: 'Profile' },
  { path: '/profile/security', label: 'Security' },
  { path: '/profile/tokens', label: 'Access tokens' },
  { path: '/profile/keys', label: 'Public keys' },
  { path: '/profile/eab', label: 'EAB credentials' },
]

export function MyProfile() {
  const { me } = useContext(CurrentUserContext)
  const { pathname } = useLocation()
  const tabStateRef = useRef<any>(null)
  const currentTab = DIRECTORY.find(tab => pathname?.startsWith(tab.path))

  return (
    <ResponsiveLayoutPage>
      <ResponsiveLayoutSidenavContainer>
        <SideNavOffset>
          <PageCard
            heading={me.name}
            icon={{ name: me.name, url: me.avatar, spacing: 'none' }}
            subheading={
              me?.roles?.admin
              && `Admin${me?.account?.name && ` at ${me?.account?.name}`}`
            }
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
        </SideNavOffset>
      </ResponsiveLayoutSidenavContainer>
      <ResponsiveLayoutSpacer />
      <TabPanel
        as={<ResponsiveLayoutContentContainer />}
        stateRef={tabStateRef}
      >
        <Outlet />
      </TabPanel>
      <ResponsiveLayoutSpacer />
    </ResponsiveLayoutPage>
  )
}
