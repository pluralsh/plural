import { PropsWithChildren, useContext, useMemo } from 'react'
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import PluralConfigurationContext from '../../../contexts/PluralConfigurationContext'
import { useStripeAppearance } from '../../WrapStripe'

export function StripeElements({
  options,
  children,
}: PropsWithChildren<{ options: StripeElementsOptions }>) {
  const { stripePublishableKey } = useContext(PluralConfigurationContext)

  const appearance = useStripeAppearance()
  const stripePromise = useMemo(() => {
    if (stripePublishableKey) {
      return loadStripe(stripePublishableKey)
    }
  }, [stripePublishableKey])

  const elementsOptions = useMemo(() => {
    const { clientSecret } = options

    if (!clientSecret) {
      return null
    }

    return {
      appearance,
      ...options,
      clientSecret,
    } satisfies StripeElementsOptions
  }, [appearance, options])

  if (!stripePromise || !elementsOptions) {
    return <>children</>
  }

  return (
    <Elements
      stripe={stripePromise}
      options={elementsOptions}
    >
      {children}
    </Elements>
  )
}
