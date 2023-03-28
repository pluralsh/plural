import { useStripe } from '@stripe/react-stripe-js'

import { namedOperations, useCreatePlatformSubscriptionMutation } from '../../../generated/graphql'
import { host } from '../../../helpers/hostname'

export function useUpgradeSubscription(
  variables, onSuccess, onFailure, fallback
) {
  const stripe = useStripe()

  return useCreatePlatformSubscriptionMutation({
    variables,
    refetchQueries: [namedOperations.Query.Subscription],
    onCompleted: result => {
      const clientSecret
          = result.createPlatformSubscription?.latestInvoice?.paymentIntent
            ?.clientSecret

      if (clientSecret) {
        const nextPath = '/account/billing?confirmReturn=1'

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
