import { Button } from '@pluralsh/design-system'
import {
  AddressElement,
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Div, Flex } from 'honorable'
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { type ImmerReducer, useImmerReducer } from 'use-immer'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { PaymentIntentFragment, namedOperations, useUpgradeToProfessionalPlanMutation } from '../../../generated/graphql'

import { host } from '../../../helpers/hostname'
import { GqlError } from '../../utils/Alert'

import BillingError from './BillingError'
import BillingPreview from './BillingPreview'

enum PaymentFormState {
  CollectAddress = 'ADDRESS',
  CollectPayment = 'PAYMENT',
}

type PaymentFormContextState = {
  formState: PaymentFormState
  clientSecret?: string | undefined | null
  paymentIntent?: PaymentIntentFragment | undefined | null
}

type PaymentFormContextVal = PaymentFormContextState & {
  setClientSecret: (
    clientSecret?: PaymentFormContextState['clientSecret']
  ) => void
  setPaymentIntent: (
    paymentIntent?: PaymentFormContextState['paymentIntent']
  ) => void
  setFormState: (state: PaymentFormState) => void
}

const defaultState: PaymentFormContextState = {
  formState: PaymentFormState.CollectAddress,
  clientSecret: undefined,
  paymentIntent: undefined,
}

const PaymentFormContext = createContext<PaymentFormContextVal | null>(null)

export const usePaymentForm = () => {
  const context = useContext(PaymentFormContext)

  if (!context) {
    throw Error('usePaymentForm() must be used within <PaymentFormProvider />')
  }

  return context
}

const reducer: ImmerReducer<
  PaymentFormContextState,
  | {
      type: 'setClientSecret'
      payload: PaymentFormContextState['clientSecret']
    }
  | {
      type: 'setPaymentIntent'
      payload: PaymentFormContextState['paymentIntent']
    }
  | { type: 'setFormState'; payload: PaymentFormState }
> = (draft, action) => {
  switch (action.type) {
  case 'setClientSecret':
    draft.clientSecret = action.payload

    return draft
    break
  case 'setFormState':
    draft.formState = action.payload

    return draft
  case 'setPaymentIntent':
    draft.paymentIntent = action.payload

    return draft

  default:
    console.error('Incorrect action type sent to reducer')

    return draft
  }
}
const paymentElementOptions: StripePaymentElementOptions = {
  layout: 'tabs',
}

function PaymentFormProvider({ children }: PropsWithChildren) {
  const [contextState, dispatch] = useImmerReducer(reducer, defaultState)

  const contextVal = useMemo(() => ({
    ...contextState,
    setClientSecret: (clientSecret: PaymentFormContextState['clientSecret']) => {
      dispatch({ type: 'setClientSecret', payload: clientSecret })
    },
    setFormState: (state: PaymentFormContextState['formState']) => {
      dispatch({ type: 'setFormState', payload: state })
    },
    setPaymentIntent: (paymentIntent: PaymentFormContextState['paymentIntent']) => {
      dispatch({ type: 'setPaymentIntent', payload: paymentIntent })
    },
  }),
  [dispatch, contextState])

  return (
    <PaymentFormContext.Provider value={contextVal}>
      {children}
    </PaymentFormContext.Provider>
  )
}

function PaymentFormInner() {
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const { formState, setClientSecret, setPaymentIntent } = usePaymentForm()
  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)
  const planId = applyYearlyDiscount
    ? proYearlyPlatformPlan.id
    : proPlatformPlan.id
  // const [loading, setLoading] = useState(false)

  if (formState === PaymentFormState.CollectAddress) {
    console.log('thing')
  }
  const [upgradeMutation, { loading, error }]
    = useUpgradeToProfessionalPlanMutation({
      refetchQueries: [namedOperations.Query.Subscription],
      onCompleted: ret => {
        const intent
          = ret.createPlatformSubscription?.latestInvoice?.paymentIntent

        console.log('paymentIntent', intent)
        setPaymentIntent(intent)
        setClientSecret(intent?.clientSecret)
      },
      onError: error => {
        console.log('mutation error', error.message)
      },
    })

  return (
    <>
      {formState === PaymentFormState.CollectAddress && (
        <>
          <BillingPreview
            noCard
            discountPreview
            yearly={applyYearlyDiscount}
            onChange={setApplyYearlyDiscount}
          />
          <Div
            fontWeight="bold"
            marginTop="large"
            marginBottom="medium"
          >
            Billing information
          </Div>
          <Flex
            flexDirection="column"
            gap="xlarge"
          >
            <AddressForm
              loading={loading}
              error={error?.message}
              onSubmit={address => {
                console.log('address submit')
                upgradeMutation({
                  variables: { planId, billingAddress: address },
                })
              }}
            />
          </Flex>
        </>
      )}
      {/* {formState === PaymentFormState.CollectPayment} && <Payment /> */}
    </>
  )
}

export default function PaymentForm() {
  return (
    <PaymentFormProvider>
      <PaymentFormInner />
    </PaymentFormProvider>
  )
}

function Payment() {
  const [message, setMessage] = useState<string | null | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

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

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
    >
      <PaymentElement
        id="payment-element"
        options={paymentElementOptions}
      />
      {/* Show any error or success messages */}

      {message && <BillingError>{message}</BillingError>}

      <Button
        type="submit"
        loading={isLoading}
        disabled={isLoading || !stripe || !elements}
        id="submit"
      >
        Upgrade now
      </Button>
    </form>
  )
}

function AddressForm({
  loading: loadingProp = false,
  error: errorProp = '',
  onSubmit,
}: {
  loading?: boolean
  error?: string
  onSubmit: (addr: {
    city: string
    country: string
    line1: string
    line2: string
    name: string
    state: string
    zip: string
  }) => void
}) {
  const [addressComplete, setAddressComplete] = useState(false)

  const [validating, setValidating] = useState(loadingProp)
  const [formError, setFormError] = useState(errorProp)
  const loading = loadingProp || validating
  const stripe = useStripe()
  const elements = useElements()
  const validateForm = useCallback(async () => {
    if (!elements) {
      return
    }
    const addressElt = elements.getElement(AddressElement)

    await (addressElt as any)?.getValue()
  }, [elements])
  const { billingAddress } = useContext(SubscriptionContext)
  const disableSubmit = !stripe || !elements || !addressComplete || loading

  const defaultAddress = useMemo(() => ({
    name: billingAddress?.name ?? '',
    address: {
      line1: billingAddress?.line1 ?? '',
      line2: billingAddress?.line2 ?? '',
      city: billingAddress?.city ?? '',
      state: billingAddress?.state ?? '',
      country: billingAddress?.country ?? '',
      postal_code: billingAddress?.zip ?? '',
    },
  }),
  [billingAddress])

  const handleSubmit = useCallback(async event => {
    console.log('handleSubmit')
    event.preventDefault()

    if (!(stripe && elements)) return

    setValidating(true)

    const addressElt = elements.getElement(AddressElement)

    if (!(addressElt)) {
      return
    }

    const addressVal = await (addressElt as any)?.getValue()

    if (!addressVal.complete) {
      setValidating(false)
      setAddressComplete(false)
      setFormError('Your billing address is incomplete.')

      return
    }

    const { address, name } = addressVal.value

    try {
      onSubmit({
        name: name || '',
        line1: address.line1 || '',
        line2: address.line2 || '',
        zip: address.zip || '',
        state: address.state || '',
        city: address.city || '',
        country: address.country || '',
      })
    }
    catch (error) {
      setFormError((error as Error)?.message)
      setValidating(false)

      return
    }

    setValidating(false)
  },
  [elements, onSubmit, stripe])

  const error = formError || errorProp

  console.log('loading', loading)

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        flexDirection="column"
        gap="xlarge"
      >
        <AddressElement
          options={{
            mode: 'billing',
            defaultValues: defaultAddress,
          }}
          onChange={event => {
            console.log('changed', event)
            setAddressComplete(event.complete)
            if (event.complete) {
              setFormError('')
            }
          }}
        />
        {error && <BillingError>{error}</BillingError>}

        <Flex justify="end">
          <Button
            type="submit"
            primary
            disabled={disableSubmit}
            loading={loading}
          >
            Continue to payment
          </Button>
        </Flex>
      </Flex>
    </form>
  )
}
