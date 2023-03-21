import { useContext, useState } from 'react'
import { Button, Card } from '@pluralsh/design-system'
import { Div } from 'honorable'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import BillingBankCardContext from '../../../contexts/BillingBankCardContext'

function BillingBankCards() {
  console.log('BillingBankCards')
  const { card } = useContext(BillingBankCardContext)
  const [edit, setEdit] = useState(false)
  const subscription = useContext(SubscriptionContext)

  console.log('subscription', subscription)

  // const { error: cardError, renderDisplay, renderEdit } = useBankCard({ setEdit })

  if (edit) {
    return (
      <Card
        display="flex"
        flexDirection="column"
        padding="medium"
        gap="medium"
      >
        TODO: Show Payment Form here
        {/* {renderEdit()} */}
        {/* {cardError && (
          <Card
            display="flex"
            alignItems="center"
            justifyContent="center"
            padding="medium"
            color="text-xlight"
          >
            <BillingError>{cardError}</BillingError>
          </Card>
        )} */}
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
          No payment method saved
        </Div>
        <Button
          onClick={() => setEdit(true)}
          marginTop="medium"
        >
          Add payment method
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
      TODO: Show card information here
      {/* {renderDisplay()} */}
    </Card>
  )
}

export default BillingBankCards
