import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Button, Card, Input } from '@pluralsh/design-system'
import { Div, Flex, Spinner } from 'honorable'
import Cards from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css'

import { CARDS_QUERY } from './queries'

function BillingBankCards() {
  const [edit, setEdit] = useState(false)
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [focused, setFocused] = useState('')
  const { data, loading, error } = useQuery(CARDS_QUERY)

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node ?? null, [data])

  const handleAddCard = useCallback(() => {
    setEdit(true)
  }, [])

  const renderEdit = useCallback(() => (
    <Flex
      align="start"
      gap="medium"
      width="100%"
    >
      <Cards
        cvc={cvc}
        expiry={expiry}
        focused={focused}
        name={name}
        number={number}
      />
      <Flex
        flexGrow={1}
        direction="column"
        gap="medium"
      >
        <Input
          width="100%"
          placeholder="Card number"
          value={number}
          onChange={event => setNumber(event.target.value)}
          onFocus={() => setFocused('number')}
        />
        <Input
          width="100%"
          placeholder="Card holder name"
          value={name}
          onChange={event => setName(event.target.value)}
          onFocus={() => setFocused('name')}
        />
        <Flex gap="medium">
          <Input
            flexGrow={1}
            placeholder="Card expiry"
            value={expiry}
            onChange={event => setExpiry(event.target.value)}
            onFocus={() => setFocused('expiry')}
          />
          <Input
            flexGrow={1}
            placeholder="CVC"
            value={cvc}
            onChange={event => setCvc(event.target.value)}
            onFocus={() => setFocused('cvc')}
          />
        </Flex>
        <Button alignSelf="flex-end">Add card</Button>
      </Flex>
    </Flex>
  ), [
    cvc,
    expiry,
    focused,
    name,
    number,
  ])

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
        alignItems="center"
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
