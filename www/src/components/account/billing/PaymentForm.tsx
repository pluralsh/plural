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

import type { AddressAttributes } from '../../../generated/graphql'
import {
  namedOperations,
  useSetupIntentMutation,
} from '../../../generated/graphql'

import { host } from '../../../helpers/hostname'
import { ErrorMessage } from '../../utils/Alert'

import BillingError from './BillingError'
import { StripeElements } from './StripeElements'

enum PaymentFormState {
  CollectAddress = 'CollectAddress',
  CollectPayment = 'CollectPayment',
}

type PaymentFormContextState = {
  formState: PaymentFormState
  plan: PlanType
  address?: AddressAttributes
}

type PaymentFormContextVal = PaymentFormContextState & {
  setFormState: (state: PaymentFormState) => void
  setPlan: (plan: PlanType) => void
  setAddress: (address: AddressAttributes) => void
  resetForm: () => void
  onClose: (e?: Event) => void
}

export type PlanType = 'yearly' | 'monthly'

const defaultState: PaymentFormContextState = {
  formState: PaymentFormState.CollectAddress,
  plan: 'monthly',
  address: undefined,
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
  | { type: 'setFormState'; payload: PaymentFormState }
  | { type: 'setPlan'; payload: PlanType }
  | { type: 'setAddress'; payload: AddressAttributes | undefined }
> = (draft, action) => {
  switch (action.type) {
    case 'setFormState':
      draft.formState = action.payload

      return draft
    case 'setPlan':
      draft.plan = action.payload

      return draft
    case 'setAddress':
      draft.address = action.payload

      return draft
    default:
      console.error('Incorrect action type sent to reducer')

      return draft
  }
}
const paymentElementOptions: StripePaymentElementOptions = {
  layout: 'tabs',
  fields: {
    billingDetails: {
      address: 'never',
    },
  },
}

function PaymentFormProvider({
  onClose,
  children,
}: PropsWithChildren<{
  onClose?: Nullable<() => void>
}>) {
  const initialFormState = PaymentFormState.CollectAddress
  const [contextState, dispatch] = useImmerReducer(reducer, {
    ...defaultState,
    formState: initialFormState,
  })

  const contextVal = useMemo(() => {
    const resetForm = () => {
      dispatch({
        type: 'setFormState',
        payload: initialFormState,
      })
    }

    return {
      ...contextState,
      setFormState: (state: PaymentFormContextState['formState']) => {
        dispatch({ type: 'setFormState', payload: state })
      },
      setPlan: (plan: PaymentFormContextState['plan']) => {
        dispatch({ type: 'setPlan', payload: plan })
      },
      setAddress: (address: AddressAttributes) => {
        dispatch({ type: 'setAddress', payload: address })
      },
      resetForm,
      onClose: (e) => {
        e?.preventDefault()
        resetForm()
        onClose?.()
      },
    }
  }, [contextState, dispatch, initialFormState, onClose])

  return (
    <PaymentFormContext.Provider value={contextVal}>
      {children}
    </PaymentFormContext.Provider>
  )
}

function PaymentFormInner() {
  const { formState } = usePaymentForm()

  return (
    <Flex
      flexDirection="column"
      gap="large"
      overflow="hidden"
    >
      <StripeElements>
        {formState === PaymentFormState.CollectAddress && (
          <Div>
            <Div
              fontWeight="bold"
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
          </Div>
        )}
        {formState === PaymentFormState.CollectPayment && <Payment />}
      </StripeElements>
    </Flex>
  )
}

export default function PaymentForm({
  onClose,
  ...props
}: Omit<ComponentProps<typeof PaymentFormProvider>, 'children'> &
  ComponentProps<typeof PaymentFormInner>) {
  return (
    <PaymentFormProvider onClose={onClose}>
      <PaymentFormInner {...props} />
    </PaymentFormProvider>
  )
}

function Payment() {
  const { setFormState, onClose, address } = usePaymentForm()

  const [message, setMessage] = useState<string | null | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  const [setupIntentMut] = useSetupIntentMutation({
    refetchQueries: [namedOperations.Query.Subscription],
  })

  useEffect(() => {
    if (!address) {
      setFormState(PaymentFormState.CollectAddress)
    }
  }, [address, setFormState])

  const handleSubmit = useCallback(
    async (e) => {
      const startSubmit = () => {
        setIsLoading(true)
      }
      const endSubmit = () => {
        setIsLoading(false)
      }

      e.preventDefault()
      if (!address) {
        setFormState(PaymentFormState.CollectAddress)

        endSubmit()

        return
      }

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return
      }

      startSubmit()

      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit()

      if (submitError) {
        endSubmit()

        return
      }

      const setupIntentResult = await setupIntentMut({
        variables: { address },
      })

      if (setupIntentResult.errors) {
        setMessage(setupIntentResult.errors[0].message)
        endSubmit()

        return
      }

      const intent = setupIntentResult.data?.setupIntent

      if (!intent?.clientSecret) {
        setMessage('Unable to create setup intent')
        endSubmit()

        return
      }

      try {
        const { error } = await stripe.confirmSetup({
          elements,
          clientSecret: intent?.clientSecret,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name: address?.name ?? '',
                address: {
                  line1: address?.line1 ?? '',
                  line2: address?.line2 ?? '',
                  city: address?.city ?? '',
                  state: address?.state ?? '',
                  country: address?.country ?? '',
                  postal_code: address.zip ?? '',
                },
              },
            },
            return_url: `${host()}/account/billing/payments`,
          },
        })

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message)
        } else {
          setMessage('An unexpected error occurred.')
        }
      } catch (e) {
        setMessage(`An unexpected error occurred: ${(e as Error)?.message}`)
      }
      endSubmit()
    },
    [address, elements, setFormState, setupIntentMut, stripe]
  )

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

        <Flex
          justify="space-between"
          gap="large"
        >
          <Button
            secondary
            onClick={() => setFormState(PaymentFormState.CollectAddress)}
          >
            Change address
          </Button>
          <Flex
            justify="flex-end"
            gap="large"
          >
            <Button
              secondary
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || !stripe || !elements}
              id="submit"
            >
              Add card
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  )
}

function AddressForm({
  loading: loadingProp = false,
  error: errorProp = '',
}: {
  loading?: boolean
  error?: string
}) {
  const [addressComplete, setAddressComplete] = useState(false)
  const [validating, setValidating] = useState(loadingProp)
  const [formError, setFormError] = useState(errorProp)
  const loading = loadingProp || validating
  const stripe = useStripe()
  const elements = useElements()
  const { setFormState, setAddress, onClose } = usePaymentForm()
  const validateForm = useCallback(async () => {
    if (!elements) {
      return
    }
    const addressElt = elements.getElement(AddressElement)

    await (addressElt as any)?.getValue()
  }, [elements])

  const disableSubmit = !stripe || !elements || !addressComplete || loading

  /* Temporarily disabling default address form filling, since we don't currently
  have a way for customers to change the billing address on their account or even
  know what their current billing address is. */

  // const defaultAddress = useMemo(() => ({
  //   name: billingAddress?.name ?? '',
  //   address: {
  //     line1: billingAddress?.line1 ?? '',
  //     line2: billingAddress?.line2 ?? '',
  //     city: billingAddress?.city ?? '',
  //     state: billingAddress?.state ?? '',
  //     country: billingAddress?.country ?? '',
  //     postal_code: billingAddress?.zip ?? '',
  //   },
  // }),
  // [billingAddress])

  const handleSubmit = useCallback(
    async (event) => {
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

      setAddress(setupIntentAddress)
      setFormState(PaymentFormState.CollectPayment)
      setValidating(false)
    },
    [elements, setAddress, setFormState, stripe]
  )

  const error = formError || errorProp

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        flexDirection="column"
        gap="xlarge"
      >
        <AddressElement
          options={{
            mode: 'billing',
            /* Temporarily disabled: See note above */
            // defaultValues: defaultAddress,
          }}
          onChange={(event) => {
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

        <Flex justify="space-between">
          <Flex
            gap="medium"
            marginLeft="auto"
          >
            <Button
              secondary
              onClick={onClose}
            >
              Cancel
            </Button>
            {/* Wrap the button so you can still validate the form on click while disabled */}
            <Div
              marginLeft="auto"
              onClick={() => {
                validateForm()
              }}
            >
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
      </Flex>
    </form>
  )
}
