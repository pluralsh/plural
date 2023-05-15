import { ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Flex, P, PProps, Spinner } from 'honorable'
import { Button, Modal } from '@pluralsh/design-system'
import { PaymentIntent, SetupIntent, StripeError } from '@stripe/stripe-js'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import { type PlanType } from './PaymentForm'
import {
  useRetrievePaymentIntent,
  useRetrieveSetupIntent,
} from './useRetrieveIntent'
import { useBillingSubscription } from './BillingSubscriptionProvider'
import { useUpgradeSubscription } from './hooks'

function ModalLoading() {
  return (
    <Flex
      width="100%"
      overflow="hidden"
      align="center"
      justify="center"
    >
      <Spinner />
    </Flex>
  )
}

function ResultMessage(props: PProps) {
  return (
    <P
      body1
      {...props}
    />
  )
}

export const useClearSearchParams = () => {
  const [_, setSearchParams] = useSearchParams()

  return () => {
    setSearchParams()
  }
}

enum UpgradeResult {
  Success = 'Success',
  Loading = 'Loading',
  Error = 'Error',
  ConfirmPaymentError = 'ConfirmPaymentError',
  StripeRequiresAction = 'StripeRequiresAction',
  StripePaymentProcessing = 'StripePaymentProcessing',
  StripeRequiresPaymentMethod = 'StripeRequiresPaymentMethod',
  StripeCancelled = 'StripeCancelled',
}

function upgradeResultToMessaging(
  result: UpgradeResult,
  error?: Error | StripeError
) {
  let header: string | undefined
  let message: ReactNode

  switch (result) {
    case UpgradeResult.Success:
      header = 'Upgrade success'
      message = (
        <ResultMessage>
          Welcome to the Plural Professional plan! You now have access to
          groups, roles, service accounts, and more.
        </ResultMessage>
      )
      break
    case UpgradeResult.Error:
      header = 'Error processing payment'
      message = (
        <ResultMessage>
          Error processing payment${error ? `: ${error.message}` : '.'}`
        </ResultMessage>
      )
      break
    case UpgradeResult.ConfirmPaymentError:
      header = 'Error completing payment'
      message = (
        <ResultMessage>
          There was an error completing your payment. Check invoice on Payments
          page to complete payment.
        </ResultMessage>
      )
      break
    case UpgradeResult.StripeRequiresAction:
      header = 'Requires action'
      message = <ResultMessage>Payment requires an action.</ResultMessage>
      break
    case UpgradeResult.StripePaymentProcessing:
      header = 'Payment processing'
      message = <ResultMessage>Payment processing.</ResultMessage>
      break
    case UpgradeResult.StripeRequiresPaymentMethod:
      header = 'Payment failed'
      message = (
        <ResultMessage>
          Payment failed. Please try another payment method.
        </ResultMessage>
      )
      break
    case UpgradeResult.Loading:
    default:
      header = 'Payment processing'
      message = <ModalLoading />
      break
  }

  return { header, message }
}

function ModalActions({
  upgradeResult,
  onClose,
}: {
  upgradeResult: UpgradeResult
  onClose: () => void
}) {
  return upgradeResult === UpgradeResult.Loading ? null : upgradeResult ===
    UpgradeResult.Success ? (
    <Button
      as={Link}
      to="/marketplace"
      onClick={() => onClose()}
    >
      Explore the app
    </Button>
  ) : (
    <Flex gap="medium">
      <Button
        secondary
        onClick={onClose}
      >
        Close
      </Button>
      {upgradeResult === UpgradeResult.ConfirmPaymentError ? (
        <Button
          as={Link}
          to="/account/billing/payments"
          onClick={onClose}
        >
          Go to Payments
        </Button>
      ) : (
        <Button
          as={Link}
          to="/account/billing?upgrade=1"
          onClick={onClose}
        >
          Retry
        </Button>
      )}
    </Flex>
  )
}

function UpgradeResultModal({
  result,
  onClose,
  open,
  error,
}: {
  result: UpgradeResult
} & { open: boolean; onClose: () => void; error?: StripeError | Error }) {
  const { header, message } = upgradeResultToMessaging(result, error)

  return (
    <Modal
      open={open}
      header={header}
      actions={
        <ModalActions
          upgradeResult={result}
          onClose={onClose}
        />
      }
      onClose={onClose}
    >
      <Flex
        body1
        gap="medium"
      >
        {message || <ModalLoading />}
      </Flex>
    </Modal>
  )
}

const setupIntentToResult: Record<SetupIntent.Status, UpgradeResult> = {
  succeeded: UpgradeResult.Loading,
  processing: UpgradeResult.StripePaymentProcessing,
  requires_payment_method: UpgradeResult.StripeRequiresPaymentMethod,
  requires_action: UpgradeResult.StripeRequiresAction,
  canceled: UpgradeResult.StripeCancelled,
  requires_confirmation: UpgradeResult.Error,
}

export default function ConfirmPayment() {
  const { isProPlan } = useBillingSubscription()
  const [searchParams, setSearchParams] = useSearchParams()

  const confirmUpgradeParam = searchParams.get('confirmUpgrade')
  const shouldConfirm = typeof confirmUpgradeParam === 'string'
  const forceSuccess = isProPlan
  const paymentIntentSecret = searchParams.get('payment_intent_client_secret')
  const setupIntentSecret = searchParams.get('setup_intent_client_secret')
  const plan: PlanType =
    searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'

  const [paymentIntent, setPaymentIntent] = useState<
    PaymentIntent | undefined
  >()

  const { proPlatformPlan, proYearlyPlatformPlan } =
    useContext(PlatformPlansContext)
  const planId =
    plan === 'yearly' ? proYearlyPlatformPlan.id : proPlatformPlan.id

  const [upgradeSuccess, setUpgradeSuccess] = useState(false)

  const onClose = useCallback(() => {
    setSearchParams()
  }, [setSearchParams])

  // Confirm payment
  const { error: retrieveSetupIntentError, intent: setupIntent } =
    useRetrieveSetupIntent({
      clientSecret: setupIntentSecret,
    })

  useRetrievePaymentIntent({
    clientSecret: paymentIntentSecret,
    onComplete: (paymentIntent) => {
      setPaymentIntent(paymentIntent)
    },
  })
  const [confirmPaymentError, setConfirmPaymentError] = useState<
    StripeError | undefined
  >(undefined)

  const paymentMethodId =
    typeof setupIntent?.payment_method === 'string'
      ? setupIntent?.payment_method
      : setupIntent?.payment_method?.id

  const [upgradeMutation, { error: upgradeError }] = useUpgradeSubscription({
    variables: { planId, paymentMethod: paymentMethodId },
    onSuccess: (result) => {
      setPaymentIntent(result.paymentIntent)
    },
    onFailure: (result) => {
      setConfirmPaymentError(result.error)
    },
    fallback: () => {
      // If didn't receive a paymentIntent or clientSecret after mutation
      // completed, assume successful upgrade
      setUpgradeSuccess(true)
    },
  })

  useEffect(() => {
    if (setupIntent) {
      upgradeMutation()
    }
  }, [setupIntent, upgradeMutation])

  const error = confirmPaymentError || upgradeError || retrieveSetupIntentError

  useEffect(() => {
    if (error?.message === 'account_id has already been taken') {
      onClose()
    }
  }, [error, onClose])

  let upgradeResult: UpgradeResult = UpgradeResult.Loading

  if (upgradeSuccess) {
    upgradeResult = UpgradeResult.Success
  } else if (confirmPaymentError) {
    upgradeResult = UpgradeResult.ConfirmPaymentError
  } else if (forceSuccess) {
    upgradeResult = UpgradeResult.Success
  } else if (error) {
    upgradeResult = UpgradeResult.Error
  } else if (paymentIntent) {
    if (paymentIntent.status === 'succeeded') {
      upgradeResult = UpgradeResult.Success
    } else {
      upgradeResult = UpgradeResult.ConfirmPaymentError
    }
  } else if (setupIntent) {
    upgradeResult =
      setupIntentToResult[setupIntent.status] ?? UpgradeResult.Error
  }

  if (
    shouldConfirm &&
    !(setupIntentSecret || paymentIntentSecret || forceSuccess)
  ) {
    return null
  }

  return (
    <UpgradeResultModal
      result={upgradeResult}
      error={error}
      open={shouldConfirm}
      onClose={onClose}
    />
  )
}
