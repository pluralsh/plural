import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Div, Flex } from 'honorable'
import { Button, LoopingLogo, Modal } from '@pluralsh/design-system'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import {
  Maybe,
  PaymentIntentFragment,
  namedOperations,
  useUpgradeToProfessionalPlanMutation,
} from '../../../generated/graphql'

import { GqlError } from '../../utils/Alert'

import BillingPreview from './BillingPreview'
import { StripeElements } from './StripeElements'
import PaymentForm from './PaymentForm'

type BillingUpgradeToProfessionalModalPropsType = {
  open: boolean
  onClose: () => void
}

function BillingUpgradeToProfessionalModal({
  open,
  onClose: onCloseProp,
}: BillingUpgradeToProfessionalModalPropsType) {
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<
    PaymentIntentFragment | null | undefined
  >(undefined)

  const planId = applyYearlyDiscount
    ? proYearlyPlatformPlan.id
    : proPlatformPlan.id

  console.log('planId', planId)

  const [upgradeMutation, { loading, error }]
    = useUpgradeToProfessionalPlanMutation({
      refetchQueries: [namedOperations.Query.Subscription],
      onCompleted: ret => {
        const intent
          = ret.createPlatformSubscription?.latestInvoice?.paymentIntent

        console.log('paymentIntent', intent)
        setPaymentIntent(intent)
      },
      onError: error => {
        console.log('mutation error', error.message)
      },
    })

  console.log('loading', loading)

  useEffect(() => {
    console.log('run upgradeMutation', upgradeMutation)
    upgradeMutation({ variables: { planId } })
  }, [planId, upgradeMutation])

  const onClose = useCallback(() => {
    onCloseProp()
  }, [onCloseProp])

  const insideContent = paymentIntent?.clientSecret ? (
    <StripeElements
      options={{ clientSecret: paymentIntent.clientSecret ?? undefined }}
    >
      <PaymentForm />
    </StripeElements>
  ) : (
    <Div
      width="100%"
      overflow="hidden"
    >
      {error ? <GqlError error={error} /> : <LoopingLogo />}
    </Div>
  )

  const content = (
    <>
      <BillingPreview
        noCard
        discountPreview
        yearly={applyYearlyDiscount}
        onChange={setApplyYearlyDiscount}
      />
      <Div
        fontWeight="bold"
        marginTop="large"
        marginBottom="medium"
      >
        Billing information
      </Div>
      <Flex
        flexDirection="column"
        gap="xlarge"
      >
        {insideContent}
      </Flex>
      <Flex
        justify="flex-end"
        marginTop="xxlarge"
        gap="small"
      >
        <Button
          secondary
          onClick={() => {
            onClose()
          }}
        >
          Cancel
        </Button>
        {/* <Button
          loading={loading}
          disabled={!card}
          onClick={onClickUpgrade}
        >
          Upgrade
        </Button> */}
      </Flex>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Upgrade to professional"
      minWidth={512 + 128}
    >
      {content}
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal
