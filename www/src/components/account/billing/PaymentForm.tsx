import { Button } from '@pluralsh/design-system'
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Div, Flex } from 'honorable'
import {
  ComponentProps,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { type ImmerReducer, useImmerReducer } from 'use-immer'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { SetupIntentFragment, namedOperations, useSetupIntentMutation } from '../../../generated/graphql'
import type { AddressAttributes } from '../../../generated/graphql'

import { host } from '../../../helpers/hostname'
import { ErrorMessage } from '../../utils/Alert'

import BillingError from './BillingError'
import BillingPreview from './BillingPreview'
import { StripeElements } from './StripeElements'

export enum PaymentFormVariant {
  Upgrade = 'UPGRADE',
  AddCard = 'ADD_CARD',
}

enum PaymentFormState {
  CollectAddress = 'ADDRESS',
  CollectPayment = 'PAYMENT',
}

type PaymentFormContextState = {
  formState: PaymentFormState
  clientSecret?: string | undefined | null
  intent?: SetupIntentFragment | undefined | null
  plan: PlanType
}

type PaymentFormContextVal = PaymentFormContextState & {
  formVariant: PaymentFormVariant
  setClientSecret: (
    clientSecret?: PaymentFormContextState['clientSecret']
  ) => void
  setIntent: (intent?: PaymentFormContextState['intent']) => void

  setFormState: (state: PaymentFormState) => void
  setPlan: (plan: PlanType) => void
}

export type PlanType = 'yearly' | 'monthly'

const defaultState: PaymentFormContextState = {
  formState: PaymentFormState.CollectAddress,
  clientSecret: undefined,
  intent: undefined,
  plan: 'monthly',
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
      type: 'setIntent'
      payload: PaymentFormContextState['intent']
    }
  | { type: 'setFormState'; payload: PaymentFormState }
  | { type: 'setPlan'; payload: PlanType }
> = (draft, action) => {
  switch (action.type) {
  case 'setClientSecret':
    draft.clientSecret = action.payload

    return draft
    break
  case 'setFormState':
    draft.formState = action.payload
    if (draft.formState === PaymentFormState.CollectAddress) {
      draft.clientSecret = undefined
    }

    return draft
  case 'setIntent':
    draft.intent = action.payload

    return draft
  case 'setPlan':
    draft.plan = action.payload

    return draft
  default:
    console.error('Incorrect action type sent to reducer')

    return draft
  }
}
const paymentElementOptions: StripePaymentElementOptions = {
  layout: 'tabs',
}

function PaymentFormProvider({
  formVariant,
  children,
}: PropsWithChildren<{ formVariant: PaymentFormVariant }>) {
  const [contextState, dispatch] = useImmerReducer(reducer, defaultState)

  const contextVal = useMemo(() => ({
    formVariant,
    ...contextState,
    setClientSecret: (clientSecret: PaymentFormContextState['clientSecret']) => {
      dispatch({ type: 'setClientSecret', payload: clientSecret })
    },
    setFormState: (state: PaymentFormContextState['formState']) => {
      dispatch({ type: 'setFormState', payload: state })
    },
    setIntent: (intent: PaymentFormContextState['intent']) => {
      dispatch({ type: 'setIntent', payload: intent })
    },
    setPlan: (plan: PaymentFormContextState['plan']) => {
      dispatch({ type: 'setPlan', payload: plan })
    },
  }),
  [formVariant, contextState, dispatch])

  return (
    <PaymentFormContext.Provider value={contextVal}>
      {children}
    </PaymentFormContext.Provider>
  )
}

function PaymentFormInner() {
  const {
    formState, plan, setPlan, clientSecret, setFormState, formVariant,
  }
    = usePaymentForm()

  if (formState === PaymentFormState.CollectAddress) {
    console.log('thing')
  }
  useEffect(() => {
    if (clientSecret) {
      setFormState(PaymentFormState.CollectPayment)
    }
    else {
      setFormState(PaymentFormState.CollectAddress)
    }
  }, [clientSecret, setFormState])

  return (
    <>
      {formVariant === PaymentFormVariant.Upgrade && (
        <BillingPreview
          noCard
          discountPreview
          yearly={plan === 'yearly'}
          onChange={isYearly => {
            setPlan(isYearly ? 'yearly' : 'monthly')
          }}
        />
      )}

      {formState === PaymentFormState.CollectAddress && (
        <>
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
            <AddressForm />
          </Flex>
        </>
      )}
      {formState === PaymentFormState.CollectPayment && clientSecret && (
        <StripeElements options={{ clientSecret }}>
          <Payment />
        </StripeElements>
      )}
    </>
  )
}

export default function PaymentForm({
  formVariant,
  ...props
}: { formVariant: PaymentFormVariant } & ComponentProps<
  typeof PaymentFormInner
>) {
  return (
    <PaymentFormProvider formVariant={formVariant}>
      <PaymentFormInner {...props} />
    </PaymentFormProvider>
  )
}

function Payment() {
  const {
    clientSecret, plan, setFormState, formVariant,
  } = usePaymentForm()
  const [message, setMessage] = useState<string | null | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async e => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url:
          formVariant === PaymentFormVariant.Upgrade
            ? `${host()}/account/billing?plan=${plan}`
            : `${host()}/account/billing/payments`,
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

  if (!clientSecret) {
    return null
  }

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
    >
      <Flex
        direction="column"
        gap="xlarge"
      >
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
        />
        {/* Show any error or success messages */}

        {message && <BillingError>{message}</BillingError>}

        <Flex justify="space-between">
          <Button
            secondary
            onClick={() => setFormState(PaymentFormState.CollectAddress)}
          >
            Change address
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !stripe || !elements}
            id="submit"
          >
            Upgrade now
          </Button>
        </Flex>
      </Flex>
    </form>
  )
}

function AddressForm({
  loading: loadingProp = false,
  error: errorProp = '',
}: // onComplete,
{
  loading?: boolean
  error?: string
  // onComplete?: ({ address: AddressAttributes, intent }) => void
}) {
  const [addressComplete, setAddressComplete] = useState(false)
  const [validating, setValidating] = useState(loadingProp)
  const [formError, setFormError] = useState(errorProp)
  const loading = loadingProp || validating
  const stripe = useStripe()
  const elements = useElements()
  const { setClientSecret, setIntent } = usePaymentForm()
  const validateForm = useCallback(async () => {
    if (!elements) {
      return
    }
    const addressElt = elements.getElement(AddressElement)

    await (addressElt as any)?.getValue()
  }, [elements])
  const { billingAddress } = useContext(SubscriptionContext)

  const [setupIntentMut] = useSetupIntentMutation({
    refetchQueries: [namedOperations.Query.Subscription],
  })

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

    if (!addressElt) {
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

    const setupIntentAddress: AddressAttributes = {
      name: `${name || ''}`,
      line1: `${address.line1 || ''}`,
      line2: `${address.line2 || ''}`,
      zip: `${address.zip || ''}`,
      state: `${address.state || ''}`,
      city: `${address.city || ''}`,
      country: `${address.country || ''}`,
    }

    const setupResult = await setupIntentMut({
      variables: { address: setupIntentAddress },
    })

    if (setupResult.errors) {
      setFormError(setupResult.errors[0].message)
      console.log('setupIntent errors', setupResult.errors)
      setValidating(false)
    }

    const intent = setupResult.data?.setupIntent

    if (intent) {
      setIntent(intent)
      setClientSecret(intent.clientSecret)
    }

    console.log('x', setupResult.data)

    setValidating(false)
  },
  [elements, setClientSecret, setIntent, setupIntentMut, stripe])

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
        {error && (
          <ErrorMessage
            header="Error"
            message={error}
          />
        )}

        <Flex justify="end">
          {/* Wrap the button so you can still validate the form on click while disabled */}
          <Div onClick={() => validateForm()}>
            <Button
              type="submit"
              primary
              disabled={disableSubmit}
              loading={loading}
            >
              Continue to payment
            </Button>
          </Div>
        </Flex>
      </Flex>
    </form>
  )
}
