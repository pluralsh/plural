import { Button, Flex } from '@pluralsh/design-system'

import { useCallback, useContext, useState } from 'react'

import { useSearchParams } from 'react-router-dom'

import styled, { useTheme } from 'styled-components'

import SubscriptionContext from 'contexts/SubscriptionContext'

import BillingPricingCards, { ContactUs } from './BillingPricingCards'
import BillingPricingTable from './BillingPricingTable'
import ConfirmPayment from './ConfirmPayment'

import BillingDowngradeModal from './BillingDowngradeModal'
import BillingUpgradeToProfessionalModal from './BillingUpgradeToProfessionalModal'

export default function BillingManagePlan() {
  const theme = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()

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

  return (
    <Flex
      direction="column"
      gap="large"
      paddingBottom={theme.spacing.xxlarge}
    >
      <ConfirmPayment />
      <BillingPricingCards
        onUpgrade={() => setUpgradeToProfessionalModalOpen(true)}
        onCancel={() => setDowngradeModalOpen(true)}
      />
      <BillingPricingTable
        onUpgrade={() => setUpgradeToProfessionalModalOpen(true)}
        onCancel={() => setDowngradeModalOpen(true)}
      />
      {/* Modals */}
      <BillingUpgradeToProfessionalModal
        open={upgradeToProfessionalModalOpen}
        onClose={() => setUpgradeToProfessionalModalOpen(false)}
      />
      <BillingDowngradeModal
        open={downgradeModalOpen}
        onClose={() => setDowngradeModalOpen(false)}
      />
    </Flex>
  )
}

export function ProPlanCTA({
  // onUpgrade,
  onCancel,
}: {
  onUpgrade: () => void
  onCancel: () => void
}) {
  const { isProPlan, isEnterprisePlan } = useContext(SubscriptionContext)

  return isProPlan ? (
    <ActionBtnSC
      secondary
      width="100%"
      onClick={onCancel}
    >
      Cancel plan
    </ActionBtnSC>
  ) : isEnterprisePlan ? (
    <ActionBtnSC
      primary
      disabled
      width="100%"
    >
      You have an Enterprise plan
    </ActionBtnSC>
  ) : (
    <ActionBtnSC
      disabled
      width="100%"
    >
      Coming soon
    </ActionBtnSC>
    // <ActionBtnSC
    //   primary
    //   width="100%"
    //   onClick={onUpgrade}
    // >
    //   Upgrade
    // </ActionBtnSC>
  )
}

export function EnterprisePlanCTA() {
  const { isProPlan } = useContext(SubscriptionContext)

  return isProPlan ? <ContactUs /> : <ContactUs floating />
}

const ActionBtnSC = styled(Button)({
  width: '100%',
})
