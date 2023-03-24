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
import {
  Div,
  Flex,
  P,
  Spinner,
} from 'honorable'
import {
  Button,
  LoopingLogo,
  Modal,
  usePrevious,
} from '@pluralsh/design-system'
import { useStripe } from '@stripe/react-stripe-js'
import { SetupIntent } from '@stripe/stripe-js'

import isEmpty from 'lodash/isEmpty'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import { namedOperations, useDefaultPaymentMethodMutation, useUpgradeToProfessionalPlanMutation } from '../../../generated/graphql'

import { host } from '../../../helpers/hostname'

import { type PlanType } from './PaymentForm'

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
  const [setupIntent, setSetupIntent] = useState<SetupIntent | null>()
  const [makeDefaultMutation] = useDefaultPaymentMethodMutation({
    refetchQueries: [namedOperations.Query.Subscription],
  })
  const prevClientSecret = usePrevious(clientSecret)
  const [defaultPaymentId, setDefaultPaymentId] = useState<string | undefined>()

  const stripe = useStripe()

  useEffect(() => {
    if (clientSecret !== prevClientSecret) {
      setError(undefined)
      setSetupIntent(undefined)
      setDefaultPaymentId(undefined)
    }
  }, [clientSecret, prevClientSecret])

  useEffect(() => {
    if (defaultPaymentId && setupIntent) {
      onComplete?.(setupIntent)
    }
  }, [defaultPaymentId, onComplete, setupIntent])
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
          setSetupIntent(setupIntent)
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

  return { error, setupIntent }
}

export function UpgradeSuccessMessage() {
  return (
    <P>
      Welcome to the Plural Professional plan! You now have access to groups,
      roles, service accounts, and more.
    </P>
  )
}

export default function ConfirmPayment() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const stripe = useStripe()

  const clientSecret = searchParams.get('setup_intent_client_secret')
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
    navigate(location.pathname)
  }, [location.pathname, navigate])

  useEffect(() => {
    if (upgradeSuccess && !isEmpty(searchParams.values)) {
      navigate(location.pathname)
    }
  }, [location.pathname, navigate, searchParams.values, upgradeSuccess])

  // Confirm payment
  const { error: confirmIntentError, setupIntent } = useRetrieveSetupIntent({
    clientSecret,
  })

  const paymentMethodId
    = typeof setupIntent?.payment_method === 'string'
      ? setupIntent?.payment_method
      : setupIntent?.payment_method?.id

  // Upgrade mutation
  const [upgradeMutation, { error: upgradeError }]
    = useUpgradeToProfessionalPlanMutation({
      variables: { planId, paymentMethod: paymentMethodId },
      refetchQueries: [namedOperations.Query.Subscription],
      onCompleted: result => {
        const clientSecret
          = result.createPlatformSubscription?.latestInvoice?.paymentIntent
            ?.clientSecret

        if (clientSecret) {
          stripe?.confirmPayment({
            clientSecret,
            confirmParams: {
              return_url: `${host()}/account/billing?confirmReturn=1`,
            },
          } as any)
        }
        else {
          console.log('no client secret after upgrade')
          setUpgradeSuccess(true)
        }
      },
    })

  useEffect(() => {
    if (setupIntent) {
      upgradeMutation()
    }
  })

  const error = upgradeError || confirmIntentError

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

    if (setupIntent) {
      switch (setupIntent?.status) {
      case 'succeeded':
        header = 'Processing'
        message = (
          <Div
            width="100%"
            overflow="hidden"
          >
            <LoopingLogo />
          </Div>
        )
        break
      case 'processing':
        header = 'Payment processing'
        message = (
          <P>
            Payment processing. We'll update you when payment is received.
          </P>
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
        message = (
          <P>
            There was an {error ? '' : 'unknown '}issue processing your
            payment
            {error ? <>': '{error.message}</> : '.'}
          </P>
        )
      }
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
        <Button
          as={Link}
          to="/marketplace"
          onClick={() => onClose()}
        >
          Explore the app
        </Button>
      )}
      onClose={onClose}
    >
      <Flex
        body1
        gap="medium"
      >
        {message || (
          <Div
            width="100%"
            overflow="hidden"
          >
            <Spinner />
          </Div>
        )}
      </Flex>
    </Modal>
  )
}
