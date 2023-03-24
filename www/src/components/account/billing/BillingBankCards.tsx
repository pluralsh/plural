import {
  ComponentProps,
  useCallback,
  useContext,
  useState,
} from 'react'
import {
  Button,
  Card,
  Chip,
  Modal,
} from '@pluralsh/design-system'
import { Div, Flex, H3 } from 'honorable'
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

export enum PaymentMethodActions {
  MakeDefault = 'makeDefault',
  Remove = 'remove',
  Select = 'select',
}

export function PaymentMethod({
  method,
  variant = PaymentFormVariant.AddCard,
}: {
  method: PaymentMethodFragment | null | undefined
  variant?: PaymentFormVariant
}) {
  const [makeDefaultMutation, { loading: defaultLoading }]
    = useDefaultPaymentMethodMutation({
      variables: { id: method?.id || '' },
      refetchQueries: [namedOperations.Query.PaymentMethods],
    })
  const [deleteCardMutation, { loading: deleteLoading }]
    = useDeletePaymentMethodMutation({
      variables: { id: method?.id || '' },
      refetchQueries: [namedOperations.Query.PaymentMethods],
    })

  const handleDelete = useCallback(() => {
    deleteCardMutation()
  }, [deleteCardMutation])
  const handleMakeDefault = useCallback(() => {
    makeDefaultMutation()
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
        justify="flex-end"
        flexGrow={1}
      >
        {method.isDefault ? (
          <Chip severity="success">
            {variant === PaymentFormVariant.AddCard
              ? 'Default card'
              : 'Selected'}
          </Chip>
        ) : (
          <Button
            small
            secondary
            loading={defaultLoading}
            onClick={handleMakeDefault}
          >
            {variant === PaymentFormVariant.AddCard ? 'Make default' : 'Select'}
          </Button>
        )}
        {variant === PaymentFormVariant.AddCard && (
          <Button
            small
            secondary
            destructive
            loading={deleteLoading}
            onClick={handleDelete}
          >
            Remove
          </Button>
        )}
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
      <PaymentForm
        formVariant={PaymentFormVariant.AddCard}
        onClose={() => {
          onClose()
        }}
      />
    </Modal>
  )
}

export function BillingAddress() {
  const subscription = useContext(SubscriptionContext)
  const { billingAddress } = subscription

  return billingAddress ? (
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
  ) : null
}

function BillingBankCards({
  paymentMethods,
}: {
  paymentMethods: (PaymentMethodFragment | null | undefined)[]
}) {
  const [addPayment, setAddPayment] = useState(false)

  return (
    <Card
      display="flex"
      flexDirection="column"
      alignItems="start"
      padding="medium"
    >
      <Flex
        direction="column"
        gap="medium"
        width="100%"
      >
        {/* <H3 subtitle2>Payment methods</H3> */}
        {isEmpty(paymentMethods) ? (
          <Div color="text-xlight">No payment method saved</Div>
        ) : (
          <Flex
            direction="column"
            gap="medium"
            width="100%"
          >
            {paymentMethods.map(paymentMethod => (
              <PaymentMethod
                key={paymentMethod?.id}
                method={paymentMethod}
              />
            ))}
          </Flex>
        )}
      </Flex>
      <Flex
        width="100%"
        justifyContent="center"
      >
        <Button
          onClick={() => setAddPayment(true)}
          marginTop="medium"
        >
          Add payment method
        </Button>
      </Flex>
      <AddPaymentMethodModal
        open={addPayment}
        onClose={() => setAddPayment(false)}
      />
    </Card>
  )
}

export default BillingBankCards
