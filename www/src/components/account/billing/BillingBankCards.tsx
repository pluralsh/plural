import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Button, Card } from '@pluralsh/design-system'
import { Div, Spinner } from 'honorable'

import { CARDS_QUERY } from './queries'

import useBankCard from './useBankCard'

function BillingBankCards() {
  const [edit, setEdit] = useState(false)
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(CARDS_QUERY)

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node ?? null, [data])

  console.log('card', card)
  const { error: cardError, renderDisplay, renderEdit } = useBankCard(card, setEdit, refetch)

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

  if (error || cardError) {
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
          onClick={() => setEdit(true)}
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
      {renderDisplay()}
    </Card>
  )
}

export default BillingBankCards
