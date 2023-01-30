import { useContext, useState } from 'react'
import { Flex } from 'honorable'
import { Button } from '@pluralsh/design-system'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import BillingPricingCard from './BillingPricingCard'
import BillingUpgradeToProfessionalModal from './BillingUpgradeToProfessionalModal'

function BillingPricingCards() {
  const { clusterMonthlyPricing, userMonthlyPricing } = useContext(PlatformPlansContext)

  const [upgradeToProfessionalModalOpen, setUpgradeToProfessionalModalOpen] = useState(false)

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
          callToAction={(
            <Button
              primary
              disabled
              width="100%"
            >
              Current plan
            </Button>
          )}
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
          callToAction={(
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
    </>
  )
}

export default BillingPricingCards
