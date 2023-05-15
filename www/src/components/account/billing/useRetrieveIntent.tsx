import { usePrevious } from '@pluralsh/design-system'
import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntent, SetupIntent, StripeError } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'

import {
  namedOperations,
  useDefaultPaymentMethodMutation,
} from '../../../generated/graphql'

type CombinedError = StripeError | Error

type BaseProps = {
  version: 'setup' | 'payment'
  clientSecret?: string | null
  onComplete?:
    | ((intent: SetupIntent) => void)
    | ((intent: PaymentIntent) => void)
  onError?: (e: CombinedError) => void
}

type PaymentProps = {
  version: 'payment'
  onComplete?: (intent: PaymentIntent) => void
} & Omit<BaseProps, 'version' | 'onComplete'>

type SetupProps = {
  version: 'setup'
  onComplete?: (intent: SetupIntent) => void
} & Omit<BaseProps, 'version' | 'onComplete'>

function useRetrieveIntent(props: SetupProps): {
  intent?: SetupIntent
  error?: CombinedError | undefined
}
function useRetrieveIntent(props: PaymentProps): {
  intent?: PaymentIntent
  error?: CombinedError | undefined
}
function useRetrieveIntent(props: BaseProps): {
  intent?: SetupIntent | PaymentIntent
  error?: CombinedError | undefined
} {
  const { version, clientSecret, onComplete, onError } = props
  const [error, setError] = useState<CombinedError | undefined>()
  const [intent, setIntent] = useState<SetupIntent | PaymentIntent>()
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
      onComplete?.(intent as any)
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
          let resIntent: PaymentIntent | SetupIntent | undefined
          let resError: StripeError | undefined

          if (version === 'setup') {
            const result = await stripe.retrieveSetupIntent(clientSecret)

            resIntent = result.setupIntent
            resError = result.error
          } else {
            const result = await stripe.retrievePaymentIntent(clientSecret)

            resIntent = result.paymentIntent
            resError = result.error
          }

          if (cancelled) {
            return
          }
          setError(resError)
          if (version === 'setup') {
            setIntent(resIntent)
          }
        } catch (e) {
          setError(e as Error)
        }

        return () => {
          cancelled = true
        }
      }
    })()
  }, [clientSecret, makeDefaultMutation, stripe, version])

  return { error, intent }
}

export default useRetrieveIntent

export function useRetrievePaymentIntent(props: Omit<PaymentProps, 'version'>) {
  return useRetrieveIntent({ version: 'payment', ...props })
}

export function useRetrieveSetupIntent(props: Omit<SetupProps, 'version'>) {
  return useRetrieveIntent({ version: 'setup', ...props })
}
