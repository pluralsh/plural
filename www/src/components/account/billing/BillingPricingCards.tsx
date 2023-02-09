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

function ContactUs({ primary }: { primary?: boolean }) {
  return (
    <Button
      as="a"
      href="https://plural.sh/contact-sales"
      target="_blank"
      rel="noopener noreferer"
      primary={primary}
      secondary={!primary}
      width="100%"
    >
      Contact sales
    </Button>
  )
}

function BillingPricingCards() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { clusterMonthlyPricing, userMonthlyPricing } = useContext(PlatformPlansContext)
  const { isProPlan, isEnterprisePlan } = useContext(SubscriptionContext)

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
              secondary
              width="100%"
              onClick={isEnterprisePlan ? null : () => setDowngradeModalOpen(true)}
            >
              Downgrade
            </Button>
          ) : (isEnterprisePlan ? <ContactUs /> : renderCurrentPlanButton())}
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
          callToAction={isProPlan ? renderCurrentPlanButton() : (isEnterprisePlan ? <ContactUs /> : (
            <Button
              primary
              width="100%"
              onClick={() => setUpgradeToProfessionalModalOpen(true)}
            >
              Upgrade now
            </Button>
          ))}
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
          callToAction={isEnterprisePlan ? renderCurrentPlanButton() : (
            isProPlan ? <ContactUs primary /> : <ContactUs />
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
