import { useContext, useState } from 'react'
import { Button, Card, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import isEmpty from 'lodash/isEmpty'

import capitalize from 'lodash/capitalize'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import BillingBankCardContext from '../../../contexts/BillingBankCardContext'

import { PaymentMethodFragment, usePaymentMethodsQuery } from '../../../generated/graphql'

import { GqlError } from '../../utils/Alert'

import PaymentForm from './PaymentForm'

function PaymentMethod({
  method,
}: {
  method: PaymentMethodFragment | null | undefined
}) {
  if (!method?.card) {
    return null
  }
  const { card } = method
  const [loading, setLoading] = useState(false)

  const handleDelete = () => {}
  const handleMakeDefault = () => {}

  return (
    <Flex
      direction="row"
      gap="medium"
      align="center"
    >
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
      </Flex>
      <Flex
        direction="row"
        gap="small"
        justify="end"
        flexGrow={1}
      >
        <Button
          small
          secondary
          destructive
          onClick={handleDelete}
          loading={loading}
        >
          Delete card
        </Button>
        <Button
          small
          secondary
          onClick={handleDelete}
          loading={loading}
        >
          Make default
        </Button>
      </Flex>
    </Flex>
  )
}

function AddPaymentMethodModal({
  open,
  onClose,
}: ComponentProps<typeof Modal>) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Upgrade to professional"
      minWidth={512 + 128}
    >
      <PaymentForm type="update" />
    </Modal>
  )
}

function BillingBankCards({
  paymentMethods,
}: {
  paymentMethods: (PaymentMethodFragment | null | undefined)[]
}) {
  console.log('BillingBankCards')
  const [addPayment, setAddPayment] = useState(false)
  const subscription = useContext(SubscriptionContext)
  const { billingAddress } = subscription

  console.log('kk billingAddress', billingAddress)
  console.log('kk paymentMethods', paymentMethods)

  return (
    <Card
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="medium"
    >
      {billingAddress && (
        <Flex
          direction="column"
          body2
        >
          {billingAddress?.line1 && <Div>{billingAddress.line1}</Div>}
          {billingAddress?.line2 && <Div>{billingAddress.line2}</Div>}
          {billingAddress?.city && <Div>{billingAddress.city}</Div>}
          {billingAddress?.state && <Div>{billingAddress.state}</Div>}
          {billingAddress?.zip && <Div>{billingAddress.zip}</Div>}
          {billingAddress?.country && <Div>{billingAddress.country}</Div>}
        </Flex>
      )}
      {isEmpty(paymentMethods) ? (
        <Div color="text-xlight">No payment method saved</Div>
      ) : (
        <Flex
          direction="column"
          gap="medium"
          width="100%"
        >
          {paymentMethods.map(paymentMethod => (
            <PaymentMethod method={paymentMethod} />
          ))}
        </Flex>
      )}

      <Button
        onClick={() => setAddPayment(true)}
        marginTop="medium"
      >
        Add payment method
      </Button>
      <AddPaymentMethodModal open={addPayment} />
    </Card>
  )
}

export default BillingBankCards
