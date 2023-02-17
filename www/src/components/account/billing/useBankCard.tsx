import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useMutation } from '@apollo/client'
import {
  Button,
  Card,
  FormField,
  Input,
} from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { capitalize } from 'lodash'

import BillingBankCardContext from '../../../contexts/BillingBankCardContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'

import { GqlError } from '../../utils/Alert'

import { CREATE_CARD_MUTATION, DELETE_CARD_MUTATION } from './queries'

function useBankCard(setEdit: Dispatch<SetStateAction<boolean>>, noCancel = false) {
  const { card, refetch } = useContext(BillingBankCardContext)
  const { billingAddress } = useContext(SubscriptionContext)

  const [name, setName] = useState(billingAddress?.name || '')
  const [line1, setLine1] = useState(billingAddress?.line1 || '')
  const [line2, setLine2] = useState(billingAddress?.line2 || '')
  const [city, setCity] = useState(billingAddress?.city || '')
  const [state, setState] = useState(billingAddress?.state || '')
  const [zip, setZip] = useState(billingAddress?.zip || '')
  const [country, setCountry] = useState(billingAddress?.country || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createCard, { error: cardError }] = useMutation(CREATE_CARD_MUTATION)
  const [deleteCard] = useMutation(DELETE_CARD_MUTATION)

  const stripe = useStripe()
  const elements = useElements()

  const address = useMemo(() => ({
    name,
    line1,
    line2,
    city,
    state,
    zip,
    country,
  }), [name,
    line1,
    line2,
    city,
    state,
    zip,
    country,
  ])
  const addressWithoutLine2 = useMemo(() => ({
    name,
    line1,
    city,
    state,
    zip,
    country,
  }), [name,
    line1,
    city,
    state,
    zip,
    country,
  ])
  const active = useMemo(() => Object.values(addressWithoutLine2).every(Boolean), [addressWithoutLine2])

  const handleSubmit = useCallback(async event => {
    event.preventDefault()

    if (!(stripe && elements)) return

    setLoading(true)

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
          address,
        },
      })

      refetch()
      setEdit(false)
    }
    catch (error) {
      setError((error as any).message)
    }

    setLoading(false)
  }, [stripe, elements, createCard, refetch, setEdit, address])

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

  const renderBillingForm = useCallback(() => (
    <>
      <FormField
        required
        label="Full name"
        marginTop="xsmall"
      >
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Enter full name or company name"
        />
      </FormField>
      <FormField
        required
        label="Address line 1"
        marginTop="xsmall"
      >
        <Input
          value={line1}
          onChange={event => setLine1(event.target.value)}
          placeholder="Enter street address"
        />
      </FormField>
      <FormField
        label="Address line 2"
        marginTop="xsmall"
      >
        <Input
          value={line2}
          onChange={event => setLine2(event.target.value)}
          placeholder="Optional"
        />
      </FormField>
      <FormField
        required
        label="City"
        marginTop="xsmall"
      >
        <Input
          value={city}
          onChange={event => setCity(event.target.value)}
          placeholder="Enter city name"
        />
      </FormField>
      <FormField
        required
        label="State/Province/Region"
        marginTop="xsmall"
      >
        <Input
          value={state}
          onChange={event => setState(event.target.value)}
          placeholder="Enter state, province, or region"
        />
      </FormField>
      <Flex
        gap="medium"
        marginTop="xxsmall"
      >
        <FormField
          required
          label="Zip/Postal code"
          flexGrow={1}
        >
          <Input
            value={zip}
            onChange={event => setZip(event.target.value)}
            placeholder="Enter zip, or postal code"
          />
        </FormField>
        <FormField
          required
          label="Country"
          flexGrow={1}
        >
          <Input
            value={country}
            onChange={event => setCountry(event.target.value)}
            placeholder="Enter country"
          />
        </FormField>
      </Flex>
    </>
  ), [
    name,
    line1,
    line2,
    city,
    state,
    zip,
    country,
  ])

  const renderEdit = useCallback(() => (
    <form onSubmit={handleSubmit}>
      {renderBillingForm()}
      <Card
        padding="small"
        display="flex"
        alignItems="center"
        gap="small"
        marginTop="small"
      >
        <Flex
          flexGrow={1}
          direction="column"
          justify="center"
          marginTop={-10}
          marginBottom={-10}
        >
          <CardElement options={{ style: { base: { color: '#747B8B' } } }} />
        </Flex>
        <Button
          type="submit"
          disabled={!active || !stripe || !elements}
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
    </form>
  ), [noCancel, stripe, elements, loading, setEdit, handleSubmit, active, renderBillingForm])

  const renderDisplay = useCallback(() => {
    if (!card) return null

    return (
      <>
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
            Delete
          </Button>
        </Flex>
      </>
    )
  }, [card, loading, cardError, handleDelete])

  return {
    renderEdit,
    renderDisplay,
    error,
  }
}

export default useBankCard
