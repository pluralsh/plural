import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useMutation } from '@apollo/client'
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

import { CREATE_CARD_MUTATION, DELETE_CARD_MUTATION } from './queries'

function useBankCard({
  setEdit,
  noCancel = false,
}: {
  setEdit: Dispatch<SetStateAction<boolean>>
  noCancel?: boolean
}) {
  const theme = useTheme() as typeof styledTheme
  const { card, refetch } = useContext(BillingBankCardContext)
  const { billingAddress: initialAddress } = useContext(SubscriptionContext)

  const [formAddress, setFormAddress] = useState({
    name: initialAddress?.name || '',
    line1: initialAddress?.line1 || '',
    line2: initialAddress?.line2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zip: initialAddress?.zip || '',
    country: initialAddress?.country || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createCard, { error: cardError }] = useMutation(CREATE_CARD_MUTATION)
  const [deleteCard] = useMutation(DELETE_CARD_MUTATION)

  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = useCallback(async event => {
    event.preventDefault()

    if (!(stripe && elements)) return

    setLoading(true)

    const addressElt = elements.getElement(AddressElement)

    const addressVal = await (addressElt as any)?.getValue()

    if (!addressVal.complete) {
      setLoading(false)
      setError('Your billing address is incomplete.')

      return
    }

    const { error, token } = await stripe.createToken(elements.getElement(CardElement)!)

    if (error) {
      setError(error.message!)
      setLoading(false)

      return
    }

    try {
      await createCard({
        variables: {
          source: token.id,
          address: formAddress,
        },
      })

      refetch()
      setEdit(false)
    }
    catch (error) {
      setError(`${capitalize((error as any).message)}.`)
    }

    setLoading(false)
  },
  [stripe, elements, createCard, formAddress, refetch, setEdit])

  const handleDelete = useCallback(async () => {
    if (!card) return

    setLoading(true)

    await deleteCard({
      variables: {
        id: card.id,
      },
    })

    refetch()
    setLoading(false)
  }, [card, deleteCard, refetch])

  const renderEdit = useCallback(() => (
    <form onSubmit={handleSubmit}>
      <Flex
        flexDirection="column"
        gap="xlarge"
      >
        <AddressElement
          options={{
            mode: 'billing',
            defaultValues: {
              name: formAddress.name,
              address: {
                line1: formAddress.line1,
                line2: formAddress.line2,
                city: formAddress.city,
                state: formAddress.state,
                country: formAddress.country,
                postal_code: formAddress.zip,
              },
            },
          }}
          onChange={event => {
            const { name, address } = event?.value || {}

            setFormAddress({
              name,
              line1: address.line1,
              line2: address.line2 ?? '',
              city: address.city,
              state: address.state,
              country: address.country,
              zip: address.postal_code,
            })
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
            />
          </Flex>
          <Button
            type="submit"
            disabled={!stripe || !elements}
            loading={loading}
          >
            Add card
          </Button>
          {!noCancel && (
            <Button
              secondary
              type="button"
              onClick={() => setEdit(false)}
            >
              Cancel
            </Button>
          )}
        </Card>
      </Flex>
    </form>
  ),
  [
    handleSubmit,
    formAddress.name,
    formAddress.line1,
    formAddress.line2,
    formAddress.city,
    formAddress.state,
    formAddress.country,
    formAddress.zip,
    stripe,
    elements,
    loading,
    noCancel,
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
        <Flex
          direction="column"
          body2
        >
          {formAddress.name && <Div>{formAddress.name}</Div>}
          {formAddress.line1 && <Div>{formAddress.line1}</Div>}
          {formAddress.line2 && <Div>{formAddress.line2}</Div>}
          {formAddress.city && <Div>{formAddress.city}</Div>}
          {formAddress.state && <Div>{formAddress.state}</Div>}
          {formAddress.zip && <Div>{formAddress.zip}</Div>}
          {formAddress.country && <Div>{formAddress.country}</Div>}
        </Flex>
        {cardError && (
          <GqlError
            error={cardError}
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
  }, [
    card,
    formAddress.name,
    formAddress.line1,
    formAddress.line2,
    formAddress.city,
    formAddress.state,
    formAddress.zip,
    formAddress.country,
    cardError,
    handleDelete,
    loading,
  ])

  return {
    renderEdit,
    renderDisplay,
    error,
    card,
  }
}

export default useBankCard
