import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { Flex } from 'honorable'
import { Button } from '@pluralsh/design-system'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'

import BillingPricingCard from './BillingPricingCard'
import BillingDowngradeModal from './BillingDowngradeModal'
import BillingUpgradeToProfessionalModal from './BillingUpgradeToProfessionalModal'

function BillingPricingCards() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { clusterMonthlyPricing, userMonthlyPricing } = useContext(PlatformPlansContext)
  const { isProPlan } = useContext(SubscriptionContext)

  const [upgradeToProfessionalModalOpen, setUpgradeToProfessionalModalOpen] = useState(false)
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false)

  const renderCurrentPlanButton = useCallback(() => (
    <Button
      primary
      disabled
      width="100%"
    >
      Current plan
    </Button>
  ), [])

  useEffect(() => {
    if (!searchParams.get('upgrade')) return

    setUpgradeToProfessionalModalOpen(true)
    setSearchParams(sp => {
      sp.delete('upgrade')

      return sp
    })
  }, [searchParams, setSearchParams])

  return (
    <>
      <Flex gap="medium">
        <BillingPricingCard
          selected
          title="Open-source"
          subtitle={(
            <>
              Free
              <br />
              <br />
            </>
          )}
          items={[
            {
              label: 'Free forever',
              checked: true,
            },
            {
              label: 'Unlimited apps',
              checked: true,
            },
            {
              label: 'Unlimited users',
              checked: true,
            },
            {
              label: 'Enforced SSO',
              checked: true,
            },
            {
              label: 'Acces to community',
              checked: true,
            },
          ]}
          callToAction={isProPlan ? (
            <Button
              tertiary
              width="100%"
              onClick={() => setDowngradeModalOpen(true)}
            >
              Downgrade
            </Button>
          ) : renderCurrentPlanButton()}
        />
        <BillingPricingCard
          title="Professional"
          subtitle={(
            <>
              ${clusterMonthlyPricing}/cluster/month
              <br />
              ${userMonthlyPricing}/user/month
            </>
          )}
          items={[
            {
              label: 'Open-source perks',
              checked: false,
            },
            {
              label: 'User management',
              checked: true,
            },
            {
              label: 'VPN',
              checked: true,
            },
            {
              label: '24 hours SLA\'s',
              checked: true,
            },
            {
              label: 'Emergency hotfixes',
              checked: true,
            },
          ]}
          callToAction={isProPlan ? renderCurrentPlanButton() : (
            <Button
              primary
              width="100%"
              onClick={() => setUpgradeToProfessionalModalOpen(true)}
            >
              Upgrade now
            </Button>
          )}
        />
        <BillingPricingCard
          title="Enterprise"
          subtitle={(
            <>
              Custom
              <br />
              <br />
            </>
          )}
          items={[
            {
              label: 'Professional perks',
              checked: false,
            },
            {
              label: 'Audit logs',
              checked: true,
            },
            {
              label: 'Dedicated enf support',
              checked: true,
            },
            {
              label: '4 hours SLA\'s',
              checked: true,
            },
            {
              label: 'Commercial license',
              checked: true,
            },
          ]}
          callToAction={(
            <Button
              as="a"
              href="https://plural.sh/contact-sales"
              target="_blank"
              rel="noopener noreferer"
              secondary
              width="100%"
            >
              Contact sales
            </Button>
          )}
        />
      </Flex>
      <BillingUpgradeToProfessionalModal
        open={upgradeToProfessionalModalOpen}
        onClose={() => setUpgradeToProfessionalModalOpen(false)}
      />
      <BillingDowngradeModal
        open={downgradeModalOpen}
        onClose={() => setDowngradeModalOpen(false)}
      />
    </>
  )
}

export default BillingPricingCards
