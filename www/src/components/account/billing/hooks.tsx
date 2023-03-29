import { useStripe } from '@stripe/react-stripe-js'
import { PaymentIntentResult } from '@stripe/stripe-js'

import { namedOperations, useCreatePlatformSubscriptionMutation } from '../../../generated/graphql'
import { host } from '../../../helpers/hostname'

export const CONFIRM_RETURN_PATH = '/account/billing?confirmUpgrade=1'

export function useUpgradeSubscription({
  variables,
  onSuccess,
  onFailure,
  fallback,
}: {
  variables: any
  onSuccess: (result: PaymentIntentResult, nextPath: string) => void
  onFailure: (result: PaymentIntentResult) => void
  fallback
}) {
  const stripe = useStripe()

  return useCreatePlatformSubscriptionMutation({
    variables,
    refetchQueries: [namedOperations.Query.Subscription],
    onCompleted: result => {
      const clientSecret
        = result.createPlatformSubscription?.latestInvoice?.paymentIntent
          ?.clientSecret

      if (clientSecret) {
        const nextPath = CONFIRM_RETURN_PATH

        stripe
          ?.confirmPayment({
            clientSecret,
            redirect: 'if_required',
            confirmParams: {
              return_url: `${host()}${nextPath}`,
            },
          } as any)
          .then(result => {
            if (result.error) {
              onFailure(result)
            }
            else {
              onSuccess(result, nextPath)
            }
          })
      }
      else {
        fallback()
      }
    },
  })
}
