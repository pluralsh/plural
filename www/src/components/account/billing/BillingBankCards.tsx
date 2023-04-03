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

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import {
  InvoiceFragment,
  PaymentMethodFragment,
  namedOperations,
  useDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from '../../../generated/graphql'

import { DeleteIconButton } from '../../utils/IconButtons'

import PaymentForm, { PaymentFormVariant } from './PaymentForm'
import { DelinquencyCallout } from './DelinquencyNotices'

export enum PaymentMethodActions {
  MakeDefault = 'makeDefault',
  Remove = 'remove',
  Select = 'select',
}

function CardBrandToDisplayName(brand: string) {
  const lookup = {
    mastercard: 'Mastercard',
    visa: 'Visa',
    amex: 'American Express',
    diners: 'Diners Club',
    unionpay: 'UnionPay',
    jcb: 'JCB',
    discover: 'Discover',
  }

  return `${lookup[brand.toLowerCase()] || 'default.svg'}`
}

function CardBrandToImgPath(brand: string) {
  const lookup = {
    mastercard: 'mastercard.svg',
    visa: 'visa.svg',
    amex: 'amex.svg',
    diners: 'diners.svg',
    unionpay: 'unionpay.svg',
    jcb: 'jcb.svg',
    discover: 'discover.svg',
  }

  return `/payment_icons/${lookup[brand.toLowerCase()] || 'default.svg'}`
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
      refetchQueries: [namedOperations.Query.Subscription],
    })
  const [deleteCardMutation, { loading: _deleteLoading }]
    = useDeletePaymentMethodMutation({
      variables: { id: method?.id || '' },
      refetchQueries: [namedOperations.Query.Subscription],
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
        <Flex
          align="center"
          justify="center"
        >
          <img
            width="48px"
            src={CardBrandToImgPath(card.brand)}
          />
        </Flex>
        <Flex
          direction="column"
          gap="xxxsmall"
        >
          <Div
            fontWeight={600}
            body1
          >
            {CardBrandToDisplayName(card.brand)} ending in {card.last4}
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
          <DeleteIconButton onClick={handleDelete} />
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
  invoices,
}: {
  paymentMethods: (PaymentMethodFragment | null | undefined)[]
  invoices?: (InvoiceFragment | null | undefined)[]
}) {
  const [addPayment, setAddPayment] = useState(false)

  return (
    <Card
      display="flex"
      flexDirection="column"
      alignItems="start"
      padding="medium"
    >
      <Div
        width="100%"
        marginBottom="medium"
      >
        <DelinquencyCallout invoices={invoices} />
      </Div>
      <Flex
        direction="column"
        gap="medium"
        width="100%"
      >
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
