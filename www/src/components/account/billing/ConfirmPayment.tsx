import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { Flex, P, Spinner } from 'honorable'
import { Button, Modal, usePrevious } from '@pluralsh/design-system'
import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntent, SetupIntent, StripeError } from '@stripe/stripe-js'

import isEmpty from 'lodash/isEmpty'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import { namedOperations, useCreatePlatformSubscriptionMutation, useDefaultPaymentMethodMutation } from '../../../generated/graphql'

import { host } from '../../../helpers/hostname'

import { type PlanType } from './PaymentForm'

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

export function UpgradeSuccessMessage() {
  return (
    <P>
      Welcome to the Plural Professional plan! You now have access to groups,
      roles, service accounts, and more.
    </P>
  )
}

const useClearSearchParams = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return () => {
    navigate(location.pathname)
  }
}

const useRetrieveSetupIntent = ({
  clientSecret,
  onComplete,
  onError,
}: {
  clientSecret?: string | null
  onComplete?: (setupIntent: SetupIntent) => void
  onError?: (e: StripeError | Error) => void
}) => {
  const [error, setError] = useState<StripeError | Error | undefined>()
  const [intent, setIntent] = useState<SetupIntent | null>()
  const [makeDefaultMutation] = useDefaultPaymentMethodMutation({
    refetchQueries: [namedOperations.Query.Subscription],
  })
  const prevClientSecret = usePrevious(clientSecret)

  const stripe = useStripe()

  useEffect(() => {
    if (clientSecret !== prevClientSecret) {
      setError(undefined)
      setIntent(undefined)
    }
  }, [clientSecret, prevClientSecret])

  useEffect(() => {
    if (intent) {
      onComplete?.(intent)
    }
  }, [onComplete, intent])
  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  useEffect(() => {
    let cancelled = false

    ;(async function x() {
      if (stripe && clientSecret) {
        try {
          const { setupIntent, error } = await stripe.retrieveSetupIntent(clientSecret)

          if (cancelled) {
            return
          }
          setError(error)
          setIntent(setupIntent)
        }
        catch (e) {
          setError(e as Error)
        }

        return () => {
          cancelled = true
        }
      }
    }())
  }, [clientSecret, makeDefaultMutation, stripe])

  return { error, setupIntent: intent }
}

const useRetrievePaymentIntent = ({
  clientSecret,
  onComplete,
  onError,
}: {
  clientSecret?: string | null
  onComplete?: (setupIntent: PaymentIntent) => void
  onError?: (e: { message?: string }) => void
}) => {
  const [error, setError] = useState<{ message?: string } | undefined>()
  const [intent, setIntent] = useState<PaymentIntent | null>()
  const [makeDefaultMutation] = useDefaultPaymentMethodMutation({
    refetchQueries: [namedOperations.Query.Subscription],
  })
  const prevClientSecret = usePrevious(clientSecret)

  const stripe = useStripe()

  useEffect(() => {
    if (clientSecret !== prevClientSecret) {
      setError(undefined)
      setIntent(undefined)
    }
  }, [clientSecret, prevClientSecret])

  useEffect(() => {
    if (intent) {
      onComplete?.(intent)
    }
  }, [onComplete, intent])
  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  useEffect(() => {
    let cancelled = false

    ;(async function x() {
      if (stripe && clientSecret) {
        try {
          const { paymentIntent: intent, error }
            = await stripe.retrievePaymentIntent(clientSecret)

          if (cancelled) {
            return
          }
          setError(error)
          setIntent(intent)
        }
        catch (e) {
          setError(e as Error)
        }

        return () => {
          cancelled = true
        }
      }
    }())
  }, [clientSecret, makeDefaultMutation, stripe])

  return { error, paymentIntent: intent }
}

function ModalActions({
  success = false,
  loading = false,
  onClose,
}: {
  success: boolean
  loading: boolean
  onClose: () => void
}) {
  return loading ? null : success ? (
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
      <Button
        as={Link}
        to="/account/billing/payment"
        onClick={onClose}
      >
        Manage payment methods
      </Button>
    </Flex>
  )
}

enum UpgradeResult {
  Success = 'Success',
  Loading = 'Loading',
  Error = 'Error',
  StripeError = 'StripeError',
  StripeConfirmPaymentError = 'StripeConfirmPaymentError',
  StripeRequiresAction = 'StripeRequiresAction',
  StripePaymentProcessing = 'StripePaymentProcessing',
  StripeRequiresPaymentMethod = 'StripeRequiresPaymentMethod',
  StripeCancelled = 'StripeCancelled',
}

function UpgradeResultModal({
  result,
  onClose,
  open,
  error,
}: {
  result: UpgradeResult
} & { open: boolean; onClose: () => void; error?: StripeError | Error }) {
  let message: ReactNode | undefined
  let header: string | undefined
  let success = false

  switch (result) {
  case UpgradeResult.Success:
    success = true
    break
  case UpgradeResult.Error:
  case UpgradeResult.StripeError:
    header = 'Error processing payment'
    message = (
      <P>Error processing payment${error ? `: ${error.message}` : '.'}`</P>
    )
    break
  case UpgradeResult.StripeConfirmPaymentError:
    header = 'Error completing payment'
    message = (
      <P body1>
        There was an error completing your payment. Check invoice on Payments
        page to complete payment.
      </P>
    )
    break
  case UpgradeResult.StripeRequiresAction:
    header = 'Requires action'
    message = (
      <P>
        Payment requires an action. Check invoice on Payments page to resolve
        issue.
      </P>
    )
    break
  case UpgradeResult.StripePaymentProcessing:
    header = 'Payment processing'
    message = (
      <P>
        Payment processing. Check invoice on Payments page to for status
        updates.
      </P>
    )
    break
  case UpgradeResult.StripeRequiresPaymentMethod:
    header = 'Payment failed'
    message = <P>Payment failed. Please try another payment method.</P>
    break
  case UpgradeResult.Loading:
  default:
    header = 'Payment processing'
    message = <ModalLoading />
    break
  }

  return (
    <Modal
      open={open}
      header={header}
      actions={(
        <ModalActions
          loading={result === UpgradeResult.Loading}
          success={success}
          onClose={onClose}
        />
      )}
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

export function ConfirmPaymentIntent({
  clientSecret: paymentIntentSecret,
}: {
  clientSecret: string
}) {
  const { paymentIntent, error } = useRetrievePaymentIntent({ clientSecret: paymentIntentSecret })
  const [isOpen, setIsOpen] = useState(!!paymentIntentSecret)
  const clearSearchParams = useClearSearchParams()

  const onClose = useCallback(() => {
    setIsOpen(false)
    clearSearchParams()
  }, [clearSearchParams])

  const loading = !error && !paymentIntent

  const paymentSuccess = paymentIntent?.status === 'succeeded'

  let upgradeResult: UpgradeResult = UpgradeResult.Loading

  if (loading) {
    upgradeResult = UpgradeResult.Loading
  }
  if (paymentSuccess) {
    upgradeResult = UpgradeResult.Success
  }
  else {
    upgradeResult = UpgradeResult.StripeConfirmPaymentError
  }

  return (
    <UpgradeResultModal
      result={upgradeResult}
      open={isOpen}
      onClose={onClose}
    />
  )
}

export const CONFIRM_PAYMENT_RETURN_PATH = '/account/billing?confirmReturn=1'

function ConfirmSetupIntent({ clientSecret: setupIntentSecret }: { clientSecret: string }) {
  const [searchParams] = useSearchParams()
  const clearSearchParams = useClearSearchParams()
  const navigate = useNavigate()
  const stripe = useStripe()

  const plan: PlanType
    = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const planId
    = plan === 'yearly' ? proYearlyPlatformPlan.id : proPlatformPlan.id

  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(!!setupIntentSecret)

  const onClose = useCallback(() => {
    setIsOpen(false)
    clearSearchParams()
  }, [clearSearchParams])

  useEffect(() => {
    if (upgradeSuccess && !isEmpty(searchParams.values)) {
      clearSearchParams()
    }
  }, [clearSearchParams, searchParams.values, upgradeSuccess])

  // Confirm payment
  const { error: retrieveSetupIntentError, setupIntent }
    = useRetrieveSetupIntent({
      clientSecret: setupIntentSecret,
    })
  const [confirmPaymentError, setConfirmPaymentError] = useState<
    StripeError | undefined
  >(undefined)

  const paymentMethodId
    = typeof setupIntent?.payment_method === 'string'
      ? setupIntent?.payment_method
      : setupIntent?.payment_method?.id

  // Upgrade mutation
  const [upgradeMutation, { error: upgradeError }]
    = useCreatePlatformSubscriptionMutation({
      variables: { planId, paymentMethod: paymentMethodId },
      refetchQueries: [namedOperations.Query.Subscription],
      onCompleted: result => {
        const clientSecret
          = result.createPlatformSubscription?.latestInvoice?.paymentIntent
            ?.clientSecret

        if (clientSecret) {
          stripe
            ?.confirmPayment({
              clientSecret,
              redirect: 'if_required',
              confirmParams: {
                return_url: `${host()}${CONFIRM_PAYMENT_RETURN_PATH}`,
              },
            } as any)
            .then(result => {
              if (result.error) {
                setConfirmPaymentError(result.error)
              }
              else {
                // Maybe do something else here to avoid double-spinner
                navigate(`${CONFIRM_PAYMENT_RETURN_PATH}&payment_intent_client_secret=${result.paymentIntent.client_secret}`)
              }
            })
        }
        else {
          // If didn't receive a paymentIntent or clientSecret after mutation
          // assume successful upgrade
          setUpgradeSuccess(true)
        }
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
  }
  else if (error) {
    upgradeResult = UpgradeResult.Error
  }
  else if (setupIntent) {
    switch (setupIntent?.status) {
    case 'succeeded':
      upgradeResult = UpgradeResult.Loading
      break
    case 'processing':
      upgradeResult = UpgradeResult.StripePaymentProcessing
      break
    case 'requires_payment_method':
      upgradeResult = UpgradeResult.StripeRequiresPaymentMethod
      break
    case 'requires_action':
      upgradeResult = UpgradeResult.StripeRequiresAction
      break
    default:
      upgradeResult = UpgradeResult.StripeError
      break
    }
  }

  if (!setupIntentSecret) {
    return null
  }

  return (
    <UpgradeResultModal
      result={upgradeResult}
      error={error}
      open={isOpen}
      onClose={onClose}
    />
  )
}

export default function ConfirmPayment() {
  const [searchParams] = useSearchParams()

  const confirmReturn = searchParams.get('confirmReturn')
  const paymentClientSecret = searchParams.get('payment_intent_client_secret')

  if (confirmReturn && paymentClientSecret) {
    return <ConfirmPaymentIntent clientSecret={paymentClientSecret} />
  }

  const setupClientSecret = searchParams.get('setup_intent_client_secret')

  if (setupClientSecret) {
    return <ConfirmSetupIntent clientSecret={setupClientSecret} />
  }

  return null
}
