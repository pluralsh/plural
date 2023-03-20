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
              label: 'Up to 5 users',
              checked: true,
            },
            {
              label: 'OAuth integration',
              checked: true,
            },
            {
              label: 'Community support',
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
              label: 'Everything in Open-source plan',
              checked: false,
            },
            {
              label: '24 hour SLA',
              checked: true,
            },
            {
              label: 'Advanced user management',
              checked: true,
            },
            {
              label: 'Audit logs',
              checked: true,
            },
            {
              label: 'VPN',
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
              label: 'Everything in Pro plan',
              checked: false,
            },
            {
              label: '4 hour SLA',
              checked: true,
            },
            {
              label: 'Dedicated SRE',
              checked: true,
            },
            {
              label: 'SSO',
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
