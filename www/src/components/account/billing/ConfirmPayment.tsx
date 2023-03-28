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
import { PaymentIntent, SetupIntent } from '@stripe/stripe-js'

import isEmpty from 'lodash/isEmpty'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import { namedOperations, useDefaultPaymentMethodMutation } from '../../../generated/graphql'

import { type PlanType } from './PaymentForm'
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
  onError?: (e: { message?: string }) => void
}) => {
  const [error, setError] = useState<{ message?: string } | undefined>()
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

type BasicError = { message?: string } | undefined

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

export function ConfirmPaymentIntent({
  clientSecret,
}: {
  clientSecret: string
}) {
  const { paymentIntent, error } = useRetrievePaymentIntent({ clientSecret })
  const [isOpen, setIsOpen] = useState(!!clientSecret)
  let message: ReactNode | undefined
  let header: string | undefined
  const clearSearchParams = useClearSearchParams()

  const onClose = useCallback(() => {
    setIsOpen(false)
    clearSearchParams()
  }, [clearSearchParams])

  const loading = !error && !paymentIntent

  const paymentSuccess = paymentIntent?.status === 'succeeded'

  if (loading) {
    header = 'Checking payment'
    message = <ModalLoading />
  }
  if (paymentSuccess) {
    header = 'Payment success'
    message = <UpgradeSuccessMessage />
  }
  else {
    header = 'Error completing payment'
    message = (
      <P body1>
        There was an error completing your payment. Check the Payments page to
        complete payment.
      </P>
    )
  }

  return (
    <Modal
      open={isOpen}
      header={header}
      actions={(
        <ModalActions
          loading={loading}
          success={paymentSuccess}
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

function ConfirmSetupIntent({ clientSecret }: { clientSecret: string }) {
  const [searchParams] = useSearchParams()
  const clearSearchParams = useClearSearchParams()
  const navigate = useNavigate()

  const plan: PlanType
    = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const planId
    = plan === 'yearly' ? proYearlyPlatformPlan.id : proPlatformPlan.id

  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(!!clientSecret)

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
      clientSecret,
    })
  const [confirmPaymentError, setConfirmPaymentError]
    = useState<BasicError>(undefined)

  const paymentMethodId
    = typeof setupIntent?.payment_method === 'string'
      ? setupIntent?.payment_method
      : setupIntent?.payment_method?.id

  // Upgrade mutation
  const [upgradeMutation, { error: upgradeError }] = useUpgradeSubscription(
    { planId, paymentMethod: paymentMethodId },
    (result, nextPath) => navigate(`${nextPath}&payment_intent_client_secret=${result.paymentIntent.client_secret}`),
    result => setConfirmPaymentError(result.error),
    () => setUpgradeSuccess(true)
  )

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

  let message: ReactNode | undefined
  let header: string | undefined

  if (upgradeSuccess) {
    header = 'Payment success'
    message = <UpgradeSuccessMessage />
  }
  else if (error) {
    header = 'Error processing payment'
    message = <P>Error processing payment: {error.message}</P>
  }
  else if (setupIntent) {
    switch (setupIntent?.status) {
    case 'succeeded':
      header = 'Processing'
      message = <ModalLoading />
      break
    case 'processing':
      header = 'Payment processing'
      message = (
        <P>Payment processing. We'll update you when payment is received.</P>
      )
      break
    case 'requires_payment_method':
      header = 'Payment failed'
      message = <P>Payment failed. Please try another payment method.</P>
      break
    case 'requires_action':
        // Possibly (hopefully) this case should never happen? Investigate to make sure
        // https://stackoverflow.com/questions/62454487/stripe-v3-setupintents-and-subscriptions
      header = 'Requires action'
      message = <P>payment requires an action</P>
      break
    default:
      header = 'Payment issue'
      message = <P>There was an unknown issue processing your payment.</P>
    }
  }

  if (!clientSecret) {
    return null
  }

  return (
    <Modal
      open={isOpen}
      header={header}
      actions={(
        <ModalActions
          loading={!message}
          success={upgradeSuccess}
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
