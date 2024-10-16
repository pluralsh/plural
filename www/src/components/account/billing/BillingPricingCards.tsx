import { Button, Card } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { useContext } from 'react'

import styled from 'styled-components'

import { ButtonProps } from '@pluralsh/design-system/dist/components/Button'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import BillingPricingCard from './BillingPricingCard'
import { EnterprisePlanCTA } from './BillingManagePlan'

export function ContactUs({ ...props }: ButtonProps) {
  return (
    <Button
      as="a"
      href="https://plural.sh/contact-sales"
      target="_blank"
      rel="noopener noreferer"
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
}: {
  onCancel: () => void
  onUpgrade: () => void
}) {
  const { isProPlan, isEnterprisePlan } = useContext(SubscriptionContext)

  return (
    <Flex
      direction="column"
      gap="large"
    >
      <CurrentPlanCard onCancel={onCancel} />
      <Flex gap="xlarge">
        <BillingPricingCard
          title="Pro Plan"
          subtitle="Cost based on # of clusters"
          items={[
            {
              label: '30 day free trial',
              checked: true,
            },
            {
              label: 'Up to 10 clusters',
              checked: true,
            },
            {
              label: 'Plural cloud hosting',
              checked: true,
            },
            {
              label: '24 hour, 99.9% SLA uptime',
              checked: true,
            },
          ]}
          callToAction={
            isProPlan ? (
              <Button
                secondary
                width="100%"
                onClick={onCancel}
              >
                Cancel plan
              </Button>
            ) : isEnterprisePlan ? (
              <Button
                primary
                disabled
                width="100%"
              >
                You have an Enterprise plan
              </Button>
            ) : (
              <Button
                primary
                width="100%"
                onClick={onUpgrade}
              >
                Upgrade
              </Button>
            )
          }
        />
        <BillingPricingCard
          title="Enterprise"
          subtitle="Custom"
          items={[
            {
              label: 'Pro plan perks',
              checked: false,
            },
            {
              label: 'Unlimited clusters',
              checked: true,
            },
            {
              label: 'Flexible hosting options',
              checked: true,
            },
            {
              label: '1 hour SLA',
              checked: true,
            },
            {
              label: 'Customized training',
              checked: true,
            },
            {
              label: 'Dedicated success team',
              checked: true,
            },
          ]}
          callToAction={<EnterprisePlanCTA />}
        />
      </Flex>
    </Flex>
  )
}

function CurrentPlanCard({ onCancel }: { onCancel: () => void }) {
  const { subscription, isProPlan } = useContext(SubscriptionContext)

  return (
    <CurrentPlanCardSC>
      <span>
        You are currently on the{' '}
        <em>{subscription?.plan?.name ?? 'Free'} Plan</em>
      </span>
      {isProPlan && (
        <Button
          secondary
          onClick={onCancel}
        >
          Cancel plan
        </Button>
      )}
    </CurrentPlanCardSC>
  )
}
const CurrentPlanCardSC = styled(Card)(({ theme }) => ({
  ...theme.partials.text.body1Bold,
  padding: theme.spacing.medium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '& em': {
    fontStyle: 'normal',
    color: theme.colors['text-primary-accent'],
  },
}))

export default BillingPricingCards
