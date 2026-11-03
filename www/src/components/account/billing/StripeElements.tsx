import { PropsWithChildren, useContext, useMemo } from 'react'
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import PluralConfigurationContext from '../../../contexts/PluralConfigurationContext'
import { useStripeAppearance } from '../../WrapStripe'

export function useStripeConfigured() {
  const { stripePublishableKey } = useContext(PluralConfigurationContext)

  return !!stripePublishableKey
}

export function StripeElements({
  clientSecret,
  children,
}: PropsWithChildren<{ clientSecret?: string | null | undefined }>) {
  const { stripePublishableKey } = useContext(PluralConfigurationContext)

  const appearance = useStripeAppearance()
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey]
  )

  const elementsOptions = useMemo(
    () =>
      ({
        appearance,
        mode: 'setup',
        currency: 'usd',
      }) satisfies StripeElementsOptions,
    [appearance]
  )

  return (
    <Elements
      // Must pass key to make sure a new <Elements> element is created
      // any time clientSecret changes. Otherwise it will error when creating
      // a <PaymentElement> in a descendant
      key={clientSecret}
      stripe={stripePromise}
      options={elementsOptions}
    >
      {children}
    </Elements>
  )
}
