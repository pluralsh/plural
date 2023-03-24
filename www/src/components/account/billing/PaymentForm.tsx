import { Button, Card } from '@pluralsh/design-system'
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

import { Link } from 'react-router-dom'

import isEmpty from 'lodash/isEmpty'

import {
  SetupIntentFragment,
  namedOperations,
  useSetupIntentMutation,
  useUpgradeToProfessionalPlanMutation,
} from '../../../generated/graphql'
import type { AddressAttributes } from '../../../generated/graphql'

import { host } from '../../../helpers/hostname'
import { ErrorMessage } from '../../utils/Alert'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import BillingError from './BillingError'
import BillingPreview from './BillingPreview'
import { StripeElements } from './StripeElements'
import { PaymentMethod } from './BillingBankCards'
import { UpgradeSuccessMessage } from './ConfirmPayment'
import { useBillingSubscription } from './BillingSubscriptionProvider'

export enum PaymentFormVariant {
  Upgrade = 'UPGRADE',
  AddCard = 'ADD_CARD',
}

enum PaymentFormState {
  CollectAddress = 'CollectAddress',
  CollectPayment = 'CollectPayment',
  SelectPaymentMethod = 'SelectPaymentMethod',
  UpgradeSuccess = 'UpgradeSuccess',
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
  resetForm: () => void
  onClose: (e?: Event) => void
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
  onClose,
  children,
}: PropsWithChildren<{
  formVariant: PaymentFormVariant
  onClose?: () => void
}>) {
  const initialFormState
    = formVariant === PaymentFormVariant.Upgrade
      ? PaymentFormState.SelectPaymentMethod
      : PaymentFormState.CollectAddress
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
      resetForm,
      onClose: e => {
        e?.preventDefault()
        resetForm()
        onClose?.()
      },
    }
  }, [formVariant, contextState, dispatch, initialFormState, onClose])

  return (
    <PaymentFormContext.Provider value={contextVal}>
      {children}
    </PaymentFormContext.Provider>
  )
}

function PaymentFormInner() {
  const {
    formState, plan, setPlan, clientSecret, formVariant,
  }
    = usePaymentForm()

  if (formState === PaymentFormState.UpgradeSuccess) {
    return <UpgradeSuccess />
  }

  return (
    <Flex
      flexDirection="column"
      gap="large"
    >
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
      {formState === PaymentFormState.SelectPaymentMethod && (
        <SelectPaymentMethod />
      )}
      <StripeElements clientSecret={clientSecret}>
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
        {formState === PaymentFormState.CollectPayment && clientSecret && (
          <Payment />
        )}
      </StripeElements>
    </Flex>
  )
}

export default function PaymentForm({
  formVariant,
  onClose,
  ...props
}: Omit<ComponentProps<typeof PaymentFormProvider>, 'children'> &
  ComponentProps<typeof PaymentFormInner>) {
  return (
    <PaymentFormProvider
      formVariant={formVariant}
      onClose={onClose}
    >
      <PaymentFormInner {...props} />
    </PaymentFormProvider>
  )
}

function Payment() {
  const {
    clientSecret, plan, setFormState, formVariant, onClose,
  }
    = usePaymentForm()
  const [message, setMessage] = useState<string | null | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    if (!clientSecret) {
      setFormState(PaymentFormState.CollectAddress)
    }
  }, [clientSecret, setFormState])

  const handleSubmit = useCallback(async e => {
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
  },
  [clientSecret, elements, formVariant, plan, stripe])

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
              {formVariant === PaymentFormVariant.Upgrade
                ? 'Upgrade now'
                : 'Add card'}
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
  const {
    clientSecret,
    setClientSecret,
    setIntent,
    setFormState,
    formVariant,
    onClose,
  } = usePaymentForm()
  const validateForm = useCallback(async () => {
    if (!elements) {
      return
    }
    const addressElt = elements.getElement(AddressElement)

    await (addressElt as any)?.getValue()
  }, [elements])
  // const { billingAddress } = useContext(SubscriptionContext)

  const [setupIntentMut] = useSetupIntentMutation({
    refetchQueries: [namedOperations.Query.Subscription],
  })

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
  useEffect(() => {
    if (clientSecret) {
      setFormState(PaymentFormState.CollectPayment)
    }
  }, [clientSecret, setFormState])
  const handleSubmit = useCallback(async event => {
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
      setValidating(false)
    }

    const intent = setupResult.data?.setupIntent

    if (intent) {
      setIntent(intent)
      setClientSecret(intent.clientSecret)
    }

    setValidating(false)
  },
  [elements, setClientSecret, setIntent, setupIntentMut, stripe])

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
          onChange={event => {
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
          {formVariant === PaymentFormVariant.Upgrade && (
            <Button
              onClick={() => {
                setFormState(PaymentFormState.SelectPaymentMethod)
              }}
            >
              Go back
            </Button>
          )}
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

function SelectPaymentMethod() {
  const { setFormState, plan } = usePaymentForm()
  const { defaultPaymentMethod, paymentMethods } = useBillingSubscription()
  const [error, setError] = useState<Error | undefined>()
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const planId
    = plan === 'yearly' ? proYearlyPlatformPlan.id : proPlatformPlan.id

  // Upgrade mutation
  const [upgradeMutation, { loading }] = useUpgradeToProfessionalPlanMutation({
    variables: { planId },
    refetchQueries: [namedOperations.Query.Subscription],
    onCompleted: () => {
      setUpgradeSuccess(true)
    },
    onError: error => {
      setError(error)
    },
  })

  useEffect(() => {
    if (isEmpty(paymentMethods)) {
      setFormState(PaymentFormState.CollectAddress)
    }
  })

  useEffect(() => {
    if (upgradeSuccess) {
      setFormState(PaymentFormState.UpgradeSuccess)
    }
  })

  return (
    <Flex
      direction="column"
      gap="large"
    >
      {!isEmpty(paymentMethods) && (
        <Card
          display="flex"
          flexDirection="column"
          maxHeight="230px"
          overflow="auto"
          gap="medium"
          width="100%"
          padding="medium"
          fillLevel={2}
        >
          {paymentMethods.map(method => (
            <PaymentMethod
              key={method.id}
              variant={PaymentFormVariant.Upgrade}
              method={method}
            />
          ))}
        </Card>
      )}
      {error && <BillingError>{error.message}</BillingError>}
      <Flex
        gap="large"
        justify="flex-end"
      >
        <Button
          secondary
          loading={loading}
          onClick={() => {
            setFormState(PaymentFormState.CollectAddress)
          }}
        >
          Use new payment method
        </Button>
        <Button
          loading={loading}
          disabled={loading || !defaultPaymentMethod}
          onClick={e => {
            e.preventDefault()
            upgradeMutation()
          }}
        >
          Upgrade with selected card
        </Button>
      </Flex>
    </Flex>
  )
}

function UpgradeSuccess() {
  const { onClose } = usePaymentForm()

  return (
    <Flex
      direction="column"
      gap="large"
    >
      <UpgradeSuccessMessage />
      <Flex justifyContent="end">
        <Button
          as={Link}
          to="/marketplace"
          onClick={() => onClose()}
        >
          Explore the app
        </Button>
      </Flex>
    </Flex>
  )
}
