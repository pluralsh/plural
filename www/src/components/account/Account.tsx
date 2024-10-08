import { TabPanel, useSetBreadcrumbs } from '@pluralsh/design-system'
import { useMemo, useRef } from 'react'
import { Outlet, useParams } from 'react-router-dom'

import { Flex } from 'honorable'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'

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

  const params = useParams()
  const subPath = params?.['*']?.split?.('/')[0]
  const breadcrumbs = useMemo(
    () => [
      { label: 'account', url: '/account' },
      ...(subPath
        ? [
            {
              label: subPath === 'edit' ? 'attributes' : subPath,
              url: `/account/${subPath}`,
            },
          ]
        : []),
    ],
    [subPath]
  )

  useSetBreadcrumbs(breadcrumbs)

  return (
    <ResponsiveLayoutPage padding={0}>
      <ResponsiveLayoutSidenavContainer
        marginLeft="large"
        marginTop="large"
      >
        <AccountSideNav tabStateRef={tabStateRef} />
      </ResponsiveLayoutSidenavContainer>
      <Flex
        grow={1}
        overflowY="auto"
        padding="large"
      >
        <TabPanel
          as={<ResponsiveLayoutContentContainer overflow="visible" />}
          stateRef={tabStateRef}
        >
          <Outlet />
        </TabPanel>
      </Flex>
    </ResponsiveLayoutPage>
  )
}
