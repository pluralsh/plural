import { PropsWithChildren, useContext, useMemo } from 'react'
import { StripeElementsOptions, loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import PluralConfigurationContext from '../../../contexts/PluralConfigurationContext'
import { useStripeAppearance } from '../../WrapStripe'

export function StripeElements({
  clientSecret,
  children,
}: PropsWithChildren<{ clientSecret?: string | null | undefined }>) {
  const { stripePublishableKey } = useContext(PluralConfigurationContext)

  const appearance = useStripeAppearance()
  const stripePromise = useMemo(() => {
    if (stripePublishableKey) {
      return loadStripe(stripePublishableKey)
    }
  }, [stripePublishableKey])

  const elementsOptions = useMemo(() => ({
    appearance,
    mode: 'setup',
    currency: 'usd',
  } satisfies StripeElementsOptions),
  [appearance])

  if (!stripePromise) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>
  }

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
