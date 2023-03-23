import {
  ComponentProps,
  useCallback,
  useContext,
  useState,
} from 'react'
import { Button, Card, Modal } from '@pluralsh/design-system'
import {
  Div,
  Flex,
  H3,
  P,
} from 'honorable'
import isEmpty from 'lodash/isEmpty'

import capitalize from 'lodash/capitalize'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import {
  PaymentMethodFragment,
  namedOperations,
  useDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from '../../../generated/graphql'

import PaymentForm, { PaymentFormVariant } from './PaymentForm'

function PaymentMethod({
  method,
}: {
  method: PaymentMethodFragment | null | undefined
}) {
  const [makeDefaultMutation, { loading: defaultLoading }] = useDefaultPaymentMethodMutation({
    variables: { id: method?.id || '' },
    refetchQueries: [namedOperations.Query.PaymentMethods],
  })
  const [deleteCardMutation, { loading: deleteLoading }] = useDeletePaymentMethodMutation({
    variables: { id: method?.id || '' },
    refetchQueries: [namedOperations.Query.PaymentMethods],
  })

  const handleDelete = useCallback(() => {
    deleteCardMutation().then(result => {
      console.log('deleteCardMutation result', result)
    })
  }, [deleteCardMutation])
  const handleMakeDefault = useCallback(() => {
    makeDefaultMutation().then(result => {
      console.log('makeDefault result:', result)
    })
  }, [makeDefaultMutation])

  if (!method?.card) {
    return null
  }
  const { card } = method

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
        align="center"
        justify="end"
        flexGrow={1}
      >
        {method.isDefault ? (
          <P body2>Default card</P>
        ) : (
          <Button
            small
            secondary
            loading={defaultLoading}
            onClick={handleMakeDefault}
          >
            Make default
          </Button>
        )}
        <Button
          small
          secondary
          destructive
          loading={deleteLoading}
          onClick={handleDelete}
        >
          Remove
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
      header="Add payment method"
      size="large"
    >
      <PaymentForm formVariant={PaymentFormVariant.AddCard} />
    </Modal>
  )
}

function BillingBankCards({
  paymentMethods,
}: {
  paymentMethods: (PaymentMethodFragment | null | undefined)[]
}) {
  const [addPayment, setAddPayment] = useState(false)
  const subscription = useContext(SubscriptionContext)
  const { billingAddress } = subscription

  return (
    <Card
      display="flex"
      flexDirection="column"
      alignItems="start"
      padding="medium"
    >
      {billingAddress && (
        <Flex
          direction="column"
          body2
          marginBottom="xlarge"
        >
          <H3
            subtitle2
            marginBottom="xsmall"
          >
            Billing address
          </H3>
          {billingAddress?.line1 && <Div>{billingAddress.line1}</Div>}
          {billingAddress?.line2 && <Div>{billingAddress.line2}</Div>}
          {billingAddress?.city && <Div>{billingAddress.city}</Div>}
          {billingAddress?.state && <Div>{billingAddress.state}</Div>}
          {billingAddress?.zip && <Div>{billingAddress.zip}</Div>}
          {billingAddress?.country && <Div>{billingAddress.country}</Div>}
        </Flex>
      )}

      <Flex
        direction="column"
        gap="medium"
        width="100%"
      >
        {' '}
        <H3 subtitle2>
          Payment methods
        </H3>
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
      </Flex>

      <Button
        onClick={() => setAddPayment(true)}
        marginTop="medium"
      >
        Add payment method
      </Button>
      <AddPaymentMethodModal
        open={addPayment}
        onClose={() => setAddPayment(false)}
      />
    </Card>
  )
}

export default BillingBankCards
