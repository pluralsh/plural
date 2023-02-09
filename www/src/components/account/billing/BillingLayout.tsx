import { Button, PageTitle } from '@pluralsh/design-system'
import { A, Div, Flex } from 'honorable'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { useContext } from 'react'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import BillingConsumptionProvider from './BillingConsumptionProvider'
import BillingBankCardProvider from './BillingBankCardProvider'
import BillingLegacyUserBanner from './BillingLegacyUserBanner'

function BillingLayout() {
  const { pricingFeaturesEnabled } = useContext(SubscriptionContext)
  const { pathname } = useLocation()

  return (
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
        {pricingFeaturesEnabled && (
          <>
            <BillingLegacyUserBanner marginBottom="large" />
            <Div
              flexGrow
              flexShrink={0}
              overflowY="auto"
              paddingRight={1}
            >
              <Outlet />
            </Div>
          </>
        )}
        {!pricingFeaturesEnabled && (
          <Div
            body1
            textAlign="center"
            padding="large"
            color="text-light"
          >
            This feature is not available to you yet.
            <br />
            Please
            {' '}
            <A
              inline
              href="https://plural.sh/contact-sales"
              target="_blank"
              rel="noreferrer noopener"
            >
              contact plural
            </A>
            {' '}
            to learn more.
          </Div>
        )}
      </BillingBankCardProvider>
    </BillingConsumptionProvider>
  )
}

export default BillingLayout
