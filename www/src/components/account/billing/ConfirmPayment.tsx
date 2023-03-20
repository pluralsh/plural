import { ReactNode, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'
import { Button, LoopingLogo, Modal } from '@pluralsh/design-system'
import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntent, StripeError } from '@stripe/stripe-js'

export default function ConfirmPayment() {
  const stripe = useStripe()
  const [searchParams] = useSearchParams()

  console.log('stripe', stripe)

  console.log('searchParams', searchParams)
  const clientSecret = searchParams.get('payment_intent_client_secret')

  // const { payment_intent_client_secret: clientSecret } = searchParams as {
  //   payment_intent?: string;
  //   payment_intent_client_secret?: string;
  // }
  console.log('clientSecret', clientSecret)

  const [error, setError] = useState<StripeError>()
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>()
  const [isOpen, setIsOpen] = useState(!!clientSecret)

  useEffect(() => {
    if (stripe && clientSecret) {
      console.log('stripe confirmCardPayment')
      try {
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error }) => {
          console.log('stripe confirmCardPayment returned, ', paymentIntent, error)

          setError(error)
          setPaymentIntent(paymentIntent)
        })
      }
      catch (e) {
        setError(e)
      }
    }
  }, [clientSecret, stripe])

  let message: ReactNode | undefined
  let header: string | undefined

  if (paymentIntent) {
    switch (paymentIntent?.status) {
    case 'succeeded':
      header = 'Payment success'
      message = (
        <P>
          Welcome to the Plural Professional plan! You now have access to
          groups, roles, service accounts, and more.
        </P>
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
