import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from 'react'
import { useMutation } from '@apollo/client'
import { Button, Card } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { capitalize } from 'lodash'

import { CREATE_CARD_MUTATION, DELETE_CARD_MUTATION } from './queries'

function useBankCard(
  card: any, setEdit: Dispatch<SetStateAction<boolean>>, refetch: () => Promise<any>, noCancel = false
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createCard] = useMutation(CREATE_CARD_MUTATION)
  const [deleteCard] = useMutation(DELETE_CARD_MUTATION)

  const stripe = useStripe()
  const elements = useElements()

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
        },
      })

      await refetch()

      setEdit(false)
    }
    catch (error) {
      setError((error as any).message)
    }

    setLoading(false)
  }, [stripe, elements, createCard, refetch, setEdit])

  const handleDelete = useCallback(async () => {
    setLoading(true)

    await deleteCard({
      variables: {
        id: card.id,
      },
    })

    await refetch()

    setLoading(false)
  }, [card, deleteCard, refetch])

  const renderEdit = useCallback(() => (
    <form onSubmit={handleSubmit}>
      <Card padding="medium">
        <CardElement options={{ style: { base: { color: 'white' } } }} />
      </Card>
      <Flex
        justify="flex-end"
        marginTop="medium"
        gap="medium"
      >
        {!noCancel && (
          <Button
            secondary
            type="button"
            onClick={() => setEdit(false)}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || !elements}
          loading={loading}
        >
          Add card
        </Button>
      </Flex>
    </form>
  ), [noCancel, stripe, elements, loading, setEdit, handleSubmit])

  const renderDisplay = useCallback(() => (
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
  ), [card, loading, handleDelete])

  return {
    renderEdit,
    renderDisplay,
    error,
  }
}

export default useBankCard
