import {
  ResponsiveLayoutContentContainer,
  ResponsiveLayoutSidecarContainer,
  ResponsiveLayoutSidenavContainer,
  ResponsiveLayoutSpacer,
} from 'components/layout/ResponsiveLayout'
import { Flex } from 'honorable'
import { TabPanel } from 'pluralsh-design-system'
import { useRef } from 'react'

import { Outlet } from 'react-router-dom'

import AccountSideNav from './AccountSidenav'

export type DomainMappingProps = {
  __typename?: 'DomainMapping'
  id?: string
  domain?: string
  enableSso?: boolean
}
export type RootUser = {
  __typename?: 'User'
  id?: 'string'
}
export type Account = {
  __typename: 'Account'
  id?: string
  rootUser?: RootUser
  name?: string
  domainMappings?: DomainMappingProps[]
  backgroundColor?: string
  billingCustomerId?: string
}

export function Account() {
  const tabStateRef = useRef<any>()

  return (
    <Flex
      height="100%"
      width="100%"
      overflowY="hidden"
      padding={32}
      paddingTop={88}
    >
      <ResponsiveLayoutSidenavContainer width={240}>
        <AccountSideNav tabStateRef={tabStateRef} />
      </ResponsiveLayoutSidenavContainer>
      <ResponsiveLayoutSpacer />
      <TabPanel
        as={<ResponsiveLayoutContentContainer overflow="visible" />}
        stateRef={tabStateRef}
      >
        <Outlet />
      </TabPanel>
      <ResponsiveLayoutSpacer />
      <ResponsiveLayoutSidecarContainer width="200px" />
    </Flex>
  )
}
