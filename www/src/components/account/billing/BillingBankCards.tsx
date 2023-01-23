import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Button, Card } from '@pluralsh/design-system'
import { Div, Flex, Spinner } from 'honorable'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'

import { CARDS_QUERY, CREATE_CARD_MUTATION } from './queries'

function BillingBankCards() {
  const [edit, setEdit] = useState(false)
  const { data, loading, error } = useQuery(CARDS_QUERY)
  const [createCard] = useMutation(CREATE_CARD_MUTATION)

  const stripe = useStripe()
  const elements = useElements()

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node ?? null, [data])

  console.log('card', card)
  const handleAddCard = useCallback(() => {
    setEdit(true)
  }, [])

  const handleSubmit = useCallback(async event => {
    event.preventDefault()

    if (!(stripe && elements)) return

    const { error, token } = await stripe.createToken(elements.getElement(CardElement)!,)

    if (error) {
      console.log('error', error)

      return
    }

    await createCard({
      variables: {
        source: token.id,
      },
    })

    console.log('good')
  }, [stripe, elements, createCard])

  const renderEdit = useCallback(() => (
    <form onSubmit={handleSubmit}>
      <Card padding="medium">
        <CardElement options={{ style: { base: { color: 'white' } } }} />
      </Card>
      <Flex
        justify="flex-end"
        marginTop="medium"
      >
        <Button
          type="submit"
          disabled={!stripe || !elements}
        >
          Add card
        </Button>
      </Flex>
    </form>
  ), [stripe, elements, handleSubmit])

  if (loading) {
    return (
      <Card
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="medium"
      >
        <Spinner />
      </Card>
    )
  }

  if (error) {
    return (
      <Card
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding="medium"
        color="text-xlight"
      >
        An error occured, please reload the page or contact support
      </Card>
    )
  }

  if (edit) {
    return (
      <Card
        display="flex"
        flexDirection="column"
        padding="medium"
      >
        {renderEdit()}
      </Card>
    )
  }

  if (!card) {
    return (
      <Card
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding="medium"
      >
        <Div color="text-xlight">
          No payment card saved
        </Div>
        <Button
          onClick={handleAddCard}
          marginTop="medium"
        >
          Add card
        </Button>
      </Card>
    )
  }

  return (
    <Card
      display="flex"
      flexDirection="column"
      padding="medium"
    >
      card
    </Card>
  )
}

export default BillingBankCards
