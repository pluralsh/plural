import { Button } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { useCallback, useContext, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import BillingDowngradeModal from './BillingDowngradeModal'

import BillingPricingCard from './BillingPricingCard'
import BillingStartTrialModal from './BillingStartTrialModal'
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

function CurrentPlanButton() {
  return (
    <Button
      primary
      disabled
      width="100%"
    >
      Current plan
    </Button>
  )
}

function BillingPricingCards() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isProPlan, isEnterprisePlan } = useContext(SubscriptionContext)

  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false)

  const upgradeToProfessionalModalOpen =
    typeof searchParams.get('upgrade') === 'string'
  const setUpgradeToProfessionalModalOpen = useCallback(
    (isOpen) => {
      setSearchParams((sp) => {
        if (isOpen) {
          sp.set('upgrade', '1')
        } else {
          sp.delete('upgrade')
        }

        return sp
      })
    },
    [setSearchParams]
  )

  const trialModalOpen = typeof searchParams.get('trial') === 'string'
  const setOpenTrialModal = useCallback(
    (isOpen) => {
      setSearchParams((params) => {
        if (isOpen) {
          params.set('trial', '1')
        } else {
          params.delete('trial')
        }

        return params
      })
    },
    [setSearchParams]
  )

  return (
    <>
      <Flex gap="medium">
        <BillingPricingCard
          selected
          title="Open-source"
          subtitle={
            <>
              Free
              <br />
              <br />
            </>
          }
          items={[
            {
              label: 'Free forever',
              checked: true,
            },
            {
              label: 'Unlimited open-source apps',
              checked: true,
            },
            {
              label: 'Up to 2 users',
              checked: true,
            },
            {
              label: '1 cluster',
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
          callToAction={
            isProPlan ? (
              <Button
                secondary
                width="100%"
                onClick={
                  isEnterprisePlan ? null : () => setDowngradeModalOpen(true)
                }
              >
                Downgrade
              </Button>
            ) : isEnterprisePlan ? (
              <ContactUs />
            ) : (
              <CurrentPlanButton />
            )
          }
        />
        <BillingPricingCard
          title="Custom"
          subtitle={
            <>
              Tailored
              <br />
              <br />
            </>
          }
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
            {
              label: 'Cost optimization',
              checked: true,
            },
          ]}
          callToAction={
            isEnterprisePlan ? (
              <CurrentPlanButton />
            ) : isProPlan ? (
              <ContactUs primary />
            ) : (
              <ContactUs />
            )
          }
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
      <BillingStartTrialModal
        open={trialModalOpen}
        onClose={() => setOpenTrialModal(false)}
      />
    </>
  )
}

export default BillingPricingCards
