import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Button, Card, styledTheme } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import {
  AddressElement,
  CardElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { capitalize } from 'lodash'

import { useTheme } from 'styled-components'

import BillingBankCardContext from '../../../contexts/BillingBankCardContext'

import { GqlError } from '../../utils/Alert'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import { useCreateCardMutation, useDeleteCardMutation } from '../../../generated/graphql'

function useBankCard({
  setEdit,
  noCancel = false,
}: {
  setEdit: Dispatch<SetStateAction<boolean>>
  noCancel?: boolean
}) {
  const [addressComplete, setAddressComplete] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)

  const theme = useTheme() as typeof styledTheme
  const { card, refetch: refetchBankCard } = useContext(BillingBankCardContext)

  const { billingAddress, refetch: refetchSubscription }
    = useContext(SubscriptionContext)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createCard, { error: createCardError }] = useCreateCardMutation()

  const [deleteCard] = useDeleteCardMutation()

  const stripe = useStripe()
  const elements = useElements()

  const resetForm = useCallback(() => {
    const cardElt = elements?.getElement(CardElement)

    cardElt?.clear()
    setLoading(false)
    setCardComplete(false)
  }, [elements])

  const validateForm = useCallback(async () => {
    if (!elements) {
      return
    }
    const addressElt = elements.getElement(AddressElement)

    await (addressElt as any)?.getValue()
  }, [elements])

  const handleSubmit = useCallback(async event => {
    event.preventDefault()

    if (!(stripe && elements)) return

    setLoading(true)

    const addressElt = elements.getElement(AddressElement)
    const cardElt = elements.getElement(CardElement)

    if (!(addressElt && cardElt)) {
      return
    }

    const addressVal = await (addressElt as any)?.getValue()

    if (!addressVal.complete) {
      setLoading(false)
      setError('Your billing address is incomplete.')

      return
    }
    if (!cardComplete) {
      setLoading(false)
      setError('Your card information is incomplete.')

      return
    }

    const { address, name } = addressVal.value

    let error:
        | Awaited<ReturnType<typeof stripe.createToken>>['error']
        | undefined
    let token:
        | Awaited<ReturnType<typeof stripe.createToken>>['token']
        | undefined

    try {
      ({ error, token } = await stripe.createToken(cardElt, {
        name: name ?? '',
        address_line1: address.line1 ?? '',
        address_line2: address.line2 ?? '',
        address_city: address.city ?? '',
        address_state: address.state ?? '',
        address_zip: address.postal_code ?? '',
        address_country: address.country ?? '',
      }))
    }
    catch (error) {
      setError((error as Error)?.message)
      setLoading(false)

      return
    }

    if (error || !token) {
      setError(error?.message || 'Unknown issue with card.')
      setLoading(false)

      return
    }

    try {
      await createCard({
        variables: {
          source: token.id,
          address: {
            name: token.card?.name ?? '',
            line1: token.card?.address_line1 ?? '',
            line2: token.card?.address_line2 ?? '',
            city: token.card?.address_city ?? '',
            state: token.card?.address_state ?? '',
            zip: token.card?.address_zip ?? '',
            country: token.card?.address_country ?? '',
          },
        },
      })
      refetchBankCard()
      refetchSubscription()
      setEdit(false)
    }
    catch (error) {
      setError(`${capitalize((error as any).message)}.`)
    }

    setLoading(false)
  },
  [
    cardComplete,
    createCard,
    elements,
    refetchBankCard,
    refetchSubscription,
    setEdit,
    stripe,
  ])

  const handleDelete = useCallback(async () => {
    if (!card) return

    setLoading(true)

    await deleteCard({
      variables: {
        id: card.id,
      },
    })

    refetchBankCard()
    refetchSubscription()
    setLoading(false)
  }, [card, deleteCard, refetchBankCard, refetchSubscription])

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

  const renderEdit = useCallback(() => {
    const disableSubmit
      = !stripe || !elements || !addressComplete || !cardComplete

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
              setAddressComplete(event.complete)
            }}
          />
          <Card
            padding="small"
            display="flex"
            alignItems="center"
            gap="small"
          >
            <Flex
              flexGrow={1}
              direction="column"
              justify="center"
              marginTop={-10}
              marginBottom={-10}
            >
              <CardElement
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      letterSpacing: `${theme.partials.text.body2Bold.letterSpacing}`,
                      fontSize: `${theme.partials.text.body2.fontSize}px`,
                      iconColor: theme.colors.text,
                      color: theme.colors.text,
                      '::placeholder': {
                        color: theme.colors['text-xlight'],
                      },
                    },
                    invalid: {
                      iconColor: theme.colors['text-danger'],
                      color: theme.colors['text-danger'],
                    },
                  },
                }}
                onChange={event => {
                  setCardComplete(event.complete)
                }}
              />
            </Flex>
            <Div
              onClick={() => {
                validateForm()
              }}
            >
              <Button
                type="submit"
                disabled={disableSubmit}
                loading={loading}
              >
                Add card
              </Button>
            </Div>
            {!noCancel && (
              <Button
                secondary
                type="button"
                onClick={() => {
                  resetForm()
                  setEdit(false)
                }}
              >
                Cancel
              </Button>
            )}
          </Card>
        </Flex>
      </form>
    )
  }, [
    stripe,
    elements,
    addressComplete,
    cardComplete,
    handleSubmit,
    defaultAddress,
    theme.partials.text.body2Bold.letterSpacing,
    theme.partials.text.body2.fontSize,
    theme.colors,
    loading,
    noCancel,
    validateForm,
    resetForm,
    setEdit,
  ])

  useEffect(() => {
    if (card) {
      setError('')
    }
  }, [card])

  const renderDisplay = useCallback(() => {
    if (!card) return null

    return (
      <Flex
        direction="column"
        gap="medium"
      >
        {billingAddress && (
          <Flex
            direction="column"
            body2
          >
            {card?.name && <Div>{card.name}</Div>}
            {billingAddress?.line1 && <Div>{billingAddress.line1}</Div>}
            {billingAddress?.line2 && <Div>{billingAddress.line2}</Div>}
            {billingAddress?.city && <Div>{billingAddress.city}</Div>}
            {billingAddress?.state && <Div>{billingAddress.state}</Div>}
            {billingAddress?.zip && <Div>{billingAddress.zip}</Div>}
            {billingAddress?.country && <Div>{billingAddress.country}</Div>}
          </Flex>
        )}
        {createCardError && (
          <GqlError
            error={createCardError}
            header="Failed to add card"
          />
        )}
        <Flex
          align="center"
          gap="small"
        >
          <Card padding="small">
            <Flex
              align="center"
              justify="center"
            >
              {card.brand}
            </Flex>
          </Card>
          <Flex
            direction="column"
            gap="xxxsmall"
          >
            <Div
              fontWeight={600}
              body1
            >
              {capitalize(card.brand)} ending in {card.last4}
            </Div>
            <Div color="text-xlight">
              Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
            </Div>
          </Flex>
          <Div flexGrow={1} />
          <Button
            secondary
            onClick={handleDelete}
            loading={loading}
          >
            Delete card
          </Button>
        </Flex>
      </Flex>
    )
  }, [card, billingAddress, createCardError, handleDelete, loading])

  return {
    renderEdit,
    renderDisplay,
    error,
    card,
    resetForm,
  }
}

export default useBankCard
