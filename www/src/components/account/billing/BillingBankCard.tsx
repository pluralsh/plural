import { useCallback, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { Button, Card } from '@pluralsh/design-system'
import { Div, Spinner } from 'honorable'

import { CARDS_QUERY } from './queries'

function BillingBankCard() {
  const { data, loading, error } = useQuery(CARDS_QUERY)

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node ?? null, [data])

  const handleAddCard = useCallback(() => {

  }, [])

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

export default BillingBankCard
