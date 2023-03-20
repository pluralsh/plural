import { Button, LoadingSpinner } from '@pluralsh/design-system'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { StripePaymentElementOptions } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'

import { host } from '../../../helpers/hostname'

import BillingError from './BillingError'

export default function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()

  //   const [_email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // This is actually handled in BillingManagePlan > ConfirmPayment

  //   useEffect(() => {
  //     if (!stripe) {
  //       return
  //     }

  //     const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret')

  //     if (!clientSecret) {
  //       return
  //     }

  //     stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
  //       switch (paymentIntent?.status) {
  //       case 'succeeded':
  //         setMessage('Payment succeeded!')
  //         break
  //       case 'processing':
  //         setMessage('Your payment is processing.')
  //         break
  //       case 'requires_payment_method':
  //         setMessage('Your payment was not successful, please try again.')
  //         break
  //       default:
  //         setMessage('Something went wrong.')
  //         break
  //       }
  //     })
  //   }, [stripe])

  const handleSubmit = async e => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${host()}/account/billing`,
      },
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    }
    else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  if (!stripe || !elements) {
    return <LoadingSpinner />
    // TODO: Better loading state
  }

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  }

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
    >
      {/* <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={e => setEmail(e.target.value)}
      /> */}
      <PaymentElement
        id="payment-element"
        options={paymentElementOptions}
      />
      <Button
        type="submit"
        loading={isLoading}
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        Upgrade now
      </Button>
      {/* Show any error or success messages */}
      {message && <BillingError>{message}</BillingError>}
    </form>
  )
}
