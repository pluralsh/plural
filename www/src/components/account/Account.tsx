import { TabPanel, useSetBreadcrumbs } from '@pluralsh/design-system'
import { useMemo, useRef } from 'react'
import { Outlet, useParams } from 'react-router-dom'

import { ResponsiveLayoutContentContainer } from '../utils/layout/ResponsiveLayoutContentContainer'
import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'
import { ResponsiveLayoutSidenavContainer } from '../utils/layout/ResponsiveLayoutSidenavContainer'
import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

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
  const breadcrumbs = useMemo(() => [
    { label: 'account', url: '/account' },
    ...(subPath
      ? [
        {
          label: subPath === 'edit' ? 'attributes' : subPath,
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
        <AccountSideNav tabStateRef={tabStateRef} />
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
    </ResponsiveLayoutPage>
  )
}
