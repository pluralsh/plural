import { Button, type ButtonProps } from '@pluralsh/design-system'

import { EnterprisePlanCTA, ProPlanCTA } from './BillingManagePlan'
import BillingPricingCard from './BillingPricingCard'
import { PlanColumnsSC } from './BillingPlanDetails'

export function ContactUs({ ...props }: ButtonProps) {
  return (
    <Button
      as="a"
      href="https://www.plural.sh/contact"
      target="_blank"
      rel="noopener noreferrer"
      width="100%"
      {...props}
    >
      Contact sales
    </Button>
  )
}

function BillingPricingCards({
  onCancel,
  onUpgrade,
  upgradeLoading,
}: {
  onCancel: () => void
  onUpgrade: () => void
  upgradeLoading: boolean
}) {
  return (
    <PlanColumnsSC>
      <BillingPricingCard
        title="Pro Plan"
        subtitle="Cost based on # of clusters"
        items={[
          { label: '30 day free trial', checked: true },
          { label: 'Up to 10 clusters', checked: true },
          { label: 'Plural cloud hosting', checked: true },
          { label: '24 hour, 99.9% SLA uptime', checked: true },
        ]}
        callToAction={
          <ProPlanCTA
            onUpgrade={onUpgrade}
            onCancel={onCancel}
            upgradeLoading={upgradeLoading}
          />
        }
      />
      <BillingPricingCard
        title="Enterprise"
        subtitle="Custom"
        items={[
          { label: 'Pro plan perks', checked: false },
          { label: 'Unlimited clusters', checked: true },
          { label: 'Flexible hosting options', checked: true },
          { label: '1 hour SLA', checked: true },
          { label: 'Customized training', checked: true },
          { label: 'Dedicated success team', checked: true },
        ]}
        callToAction={<EnterprisePlanCTA />}
      />
    </PlanColumnsSC>
  )
}

export default BillingPricingCards
