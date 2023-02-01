import { Button, PageTitle } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Link, Outlet, useLocation } from 'react-router-dom'

import BillingPlatformPlansProvider from './BillingPlatformPlansProvider'
import BillingConsumptionProvider from './BillingConsumptionProvider'
import BillingBankCardProvider from './BillingBankCardProvider'
import BillingLegacyUserBanner from './BillingLegacyUserBanner'

function BillingLayout() {
  const { pathname } = useLocation()

  return (
    <BillingPlatformPlansProvider>
      <BillingConsumptionProvider>
        <BillingBankCardProvider>
          <PageTitle heading="Billing">
            <Flex>
              <Button
                tertiary
                backgroundColor={pathname.endsWith('billing') ? 'fill-two' : undefined}
                as={Link}
                to="/account/billing"
              >
                Manage plan
              </Button>
              <Button
                tertiary
                backgroundColor={pathname.endsWith('payments') ? 'fill-two' : undefined}
                as={Link}
                to="/account/billing/payments"
              >
                Payments
              </Button>
            </Flex>
          </PageTitle>
          <BillingLegacyUserBanner marginBottom="medium" />
          <Div
            flexGrow
            overflowY="auto"
            paddingRight={1}
          >
            <Outlet />
          </Div>
        </BillingBankCardProvider>
      </BillingConsumptionProvider>
    </BillingPlatformPlansProvider>
  )
}

export default BillingLayout
