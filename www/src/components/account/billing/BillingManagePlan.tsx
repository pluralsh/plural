import { Button, Flex, Toast } from '@pluralsh/design-system'

import { useLayoutEffect, useState } from 'react'

import { useTheme } from 'styled-components'

import BillingPricingCards, { ContactUs } from './BillingPricingCards'
import BillingPricingTable from './BillingPricingTable'

import { GqlError } from 'components/utils/Alert'
import LoadingIndicator from 'components/utils/LoadingIndicator'
import {
  useFinalizeCheckoutMutation,
  useInitiateCheckoutMutation,
} from 'generated/graphql'
import { useSearchParams } from 'react-router-dom'
import BillingDowngradeModal from './BillingDowngradeModal'
import { useBillingSubscription } from './BillingSubscriptionProvider'

export default function BillingManagePlan() {
  const theme = useTheme()
  const { refetch } = useBillingSubscription()
  const [searchParams, setSearchParams] = useSearchParams()

  const [refetching, setRefetching] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false)

  const [
    initiateCheckout,
    { loading: initiateCheckoutLoading, error: initiateCheckoutError },
  ] = useInitiateCheckoutMutation({
    onCompleted: (data) => {
      if (data.initiateCheckout?.url)
        window.location.href = data.initiateCheckout.url
    },
  })

  const [
    finalizeCheckout,
    { loading: finalizeCheckoutLoading, error: finalizeCheckoutError },
  ] = useFinalizeCheckoutMutation({
    onCompleted: () => {
      setRefetching(true)
      refetch().then(() => {
        setRefetching(false)
        setSearchParams({})
        setShowSuccessToast(true)
      })
    },
  })

  useLayoutEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) finalizeCheckout({ variables: { sessionId } })
  }, [searchParams, finalizeCheckout])

  if (finalizeCheckoutLoading || refetching) return <LoadingIndicator />

  return (
    <Flex
      direction="column"
      gap="large"
      paddingBottom={theme.spacing.xxlarge}
    >
      {finalizeCheckoutError && <GqlError error={finalizeCheckoutError} />}
      {initiateCheckoutError && <GqlError error={initiateCheckoutError} />}
      <BillingPricingCards
        onUpgrade={() => initiateCheckout()}
        upgradeLoading={initiateCheckoutLoading}
        onCancel={() => setDowngradeModalOpen(true)}
      />
      <BillingPricingTable
        onUpgrade={() => initiateCheckout()}
        upgradeLoading={initiateCheckoutLoading}
        onCancel={() => setDowngradeModalOpen(true)}
      />
      {/* Modals */}
      <BillingDowngradeModal
        open={downgradeModalOpen}
        onClose={() => setDowngradeModalOpen(false)}
      />
      <Toast
        position="bottom"
        severity="success"
        show={showSuccessToast}
        closeTimeout={3000}
        onClose={() => setShowSuccessToast(false)}
      >
        Upgraded to Pro plan!
      </Toast>
    </Flex>
  )
}

export function ProPlanCTA({
  onUpgrade,
  onCancel,
  upgradeLoading,
}: {
  onUpgrade: () => void
  onCancel: () => void
  upgradeLoading: boolean
}) {
  const { isProPlan, isEnterprisePlan } = useBillingSubscription()

  return isProPlan ? (
    <Button
      secondary
      width="100%"
      onClick={onCancel}
    >
      Cancel plan
    </Button>
  ) : isEnterprisePlan ? (
    <Button
      disabled
      width="100%"
    >
      You have an Enterprise plan
    </Button>
  ) : (
    <Button
      width="100%"
      onClick={onUpgrade}
      loading={upgradeLoading}
    >
      Upgrade
    </Button>
  )
}

export function EnterprisePlanCTA() {
  const { isProPlan } = useBillingSubscription()

  return isProPlan ? <ContactUs /> : <ContactUs floating />
}
