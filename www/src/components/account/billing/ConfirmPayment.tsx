import {
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'
import { Button, LoopingLogo, Modal } from '@pluralsh/design-system'
import { useStripe } from '@stripe/react-stripe-js'
import { SetupIntent } from '@stripe/stripe-js'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import { namedOperations, useUpgradeToProfessionalPlanMutation } from '../../../generated/graphql'

import { PlanType } from './PaymentForm'

export default function ConfirmPayment() {
  const stripe = useStripe()
  const [searchParams] = useSearchParams()

  console.log('stripe', stripe)

  console.log('searchParams', searchParams)
  const clientSecret = searchParams.get('setup_intent_client_secret')
  const plan: PlanType
    = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const planId
    = plan === 'yearly' ? proYearlyPlatformPlan.id : proPlatformPlan.id

  console.log('clientSecret', clientSecret)

  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [error, setError] = useState<{ message?: string } | undefined>()
  const [setupIntent, setPaymentIntent] = useState<SetupIntent | null>()
  const [isOpen, setIsOpen] = useState(!!clientSecret)

  // Upgrade mutation
  const [upgradeMutation] = useUpgradeToProfessionalPlanMutation({
    variables: { planId },
    refetchQueries: [namedOperations.Query.Subscription],
    onCompleted: ret => {
      const intent
        = ret.createPlatformSubscription?.latestInvoice?.paymentIntent

      console.log('paymentIntent', intent)
      setUpgradeSuccess(true)
    },
    onError: error => {
      setError(error)
      console.log('Mutation error', error.message)
    },
  })

  // Confirm payment
  useEffect(() => {
    if (stripe && clientSecret) {
      console.log('stripe confirmCardPayment')
      try {
        stripe
          .retrieveSetupIntent(clientSecret)
          .then(({ setupIntent, error }) => {
            console.log('stripe confirmCardPayment returned, ',
              setupIntent,
              error)

            setError(error)
            setPaymentIntent(setupIntent)
            if (setupIntent?.status === 'succeeded') {
              console.log('succeeded payment', "don't mutate yet")
              console.log('setupIntent', setupIntent)
              console.log('UPGRADE MUTATION REQUESTED')

              upgradeMutation().then(r => {
                console.log('UPGRADE MUTATION COMPLETE', r)
              })
            }
          })
      }
      catch (e) {
        setError(e as Error)
      }
    }
  }, [clientSecret, stripe, upgradeMutation])

  let message: ReactNode | undefined
  let header: string | undefined

  if (upgradeSuccess) {
    header = 'Payment success'
    message = (
      <P>
        Welcome to the Plural Professional plan! You now have access to groups,
        roles, service accounts, and more.
      </P>
    )
  }
  else if (setupIntent) {
    switch (setupIntent?.status) {
    case 'succeeded':
        // TODO: Actually do the plan
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
        <P>Payment processing. We'll update you when payment is received.</P>
      )
      break
    case 'requires_payment_method':
      header = 'Payment failed'
      message = <P>Payment failed. Please try another payment method.</P>
      break
    default:
      header = 'Payment issue'
      message = (
        <P>
          There was an {error ? '' : 'unknown'} issue processing your payment
          {error ? <>': '{error.message}</> : '.'}
        </P>
      )
    }
  }
  else if (error) {
    header = 'Error processing payment'
    message = <P>Error processing payment: {error.message}</P>
  }

  const onClose = () => {
    setIsOpen(false)
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
            <LoopingLogo />
          </Div>
        )}
      </Flex>
    </Modal>
  )
}
