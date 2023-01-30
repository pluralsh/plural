import { useContext, useState } from 'react'
import { Button, Card } from '@pluralsh/design-system'
import { Div } from 'honorable'

import BillingBankCardContext from '../../../contexts/BillingBankCardContext'

import useBankCard from './useBankCard'

function BillingBankCards() {
  const { card } = useContext(BillingBankCardContext)
  const [edit, setEdit] = useState(false)

  const { error: cardError, renderDisplay, renderEdit } = useBankCard(setEdit)

  if (cardError) {
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
