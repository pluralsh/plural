import {
  Chip,
  Flex,
  Tab,
  TabList,
  useSetBreadcrumbs,
} from '@pluralsh/design-system'
import { Suspense, useMemo, useRef } from 'react'

import LoadingIndicator from '../../utils/LoadingIndicator'
import { Outlet, useLocation } from 'react-router-dom'

import { ResponsiveLayoutPage } from '../../utils/layout/ResponsiveLayoutPage'
import { ResponsiveLayoutSidenavContainer } from '../../utils/layout/ResponsiveLayoutSidenavContainer'
import { SideNavOffset } from '../../utils/layout/SideNavOffset'
import { PageHeader } from '../../utils/ProductEmptyState'
import { LinkTabWrap } from '../../utils/Tabs'

import BillingConsumptionProvider from './BillingConsumptionProvider'
import BillingLegacyUserBanner from './BillingLegacyUserBanner'
import { BillingPlanActions } from './BillingPlanDetails'

export const BILLING_PATH_ABS = '/account/billing'

const DIRECTORY = [
  { label: 'Manage plan', path: '' },
  { label: 'Usage', path: 'usage' },
  { label: 'Payments', path: 'payments' },
]

function BillingLayout() {
  const tabStateRef = useRef<any>(null)
  const { pathname } = useLocation()
  const subPath =
    pathname.match(/\/account\/billing\/(payments|usage)/)?.[1] ?? ''
  const breadcrumbs = useMemo(
    () => [
      { label: 'billing', url: BILLING_PATH_ABS },
      ...(subPath
        ? [{ label: subPath, url: `${BILLING_PATH_ABS}/${subPath}` }]
        : []),
    ],
    [subPath]
  )

  useSetBreadcrumbs(breadcrumbs)

  const title =
    DIRECTORY.find(({ path }) => path === subPath)?.label ?? 'Billing'

  return (
    <BillingConsumptionProvider>
      <ResponsiveLayoutPage padding={0}>
        <ResponsiveLayoutSidenavContainer
          marginLeft="large"
          marginTop="large"
        >
          <SideNavOffset>
            <TabList
              stateRef={tabStateRef}
              stateProps={{ orientation: 'vertical', selectedKey: subPath }}
            >
              {DIRECTORY.map(({ label, path }) => (
                <LinkTabWrap
                  vertical
                  key={path}
                  textValue={label}
                  to={path ? `${BILLING_PATH_ABS}/${path}` : BILLING_PATH_ABS}
                >
                  <Tab>{label}</Tab>
                </LinkTabWrap>
              ))}
            </TabList>
          </SideNavOffset>
        </ResponsiveLayoutSidenavContainer>
        <Flex
          direction="column"
          grow={1}
          minWidth={0}
          overflowY="auto"
          padding="large"
        >
          <Flex
            direction="column"
            width="100%"
            maxWidth={1280}
            marginLeft="auto"
            marginRight="auto"
          >
            <Flex
              direction="column"
              marginBottom="large"
            >
              <PageHeader
                title={
                  <>
                    {title}
                    {subPath === 'usage' && (
                      <Chip
                        size="small"
                        severity="info"
                      >
                        Preview
                      </Chip>
                    )}
                  </>
                }
              >
                {!subPath && <BillingPlanActions />}
              </PageHeader>
            </Flex>
            <BillingLegacyUserBanner />
            <Suspense fallback={<LoadingIndicator />}>
              <Outlet />
            </Suspense>
          </Flex>
        </Flex>
      </ResponsiveLayoutPage>
    </BillingConsumptionProvider>
  )
}

export default BillingLayout
