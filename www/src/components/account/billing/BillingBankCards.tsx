import { Button, Card, Chip, Flex, Modal } from '@pluralsh/design-system'
import isEmpty from 'lodash/isEmpty'
import { ComponentProps, useState } from 'react'
import { useTheme } from 'styled-components'

import {
  InvoiceFragment,
  PaymentMethodFragment,
  namedOperations,
  useDefaultPaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from '../../../generated/graphql'

import { GqlError } from '../../utils/Alert'
import { DeleteIconButton } from '../../utils/IconButtons'
import { Body1P, Body2P } from '../../utils/Typography'

import { DelinquencyCallout } from './DelinquencyNotices'
import PaymentForm from './PaymentForm'

const CARD_BRANDS: Record<string, { name: string; icon: string }> = {
  mastercard: { name: 'Mastercard', icon: 'mastercard.svg' },
  visa: { name: 'Visa', icon: 'visa.svg' },
  amex: { name: 'American Express', icon: 'amex.svg' },
  diners: { name: 'Diners Club', icon: 'diners.svg' },
  unionpay: { name: 'UnionPay', icon: 'unionpay.svg' },
  jcb: { name: 'JCB', icon: 'jcb.svg' },
  discover: { name: 'Discover', icon: 'discover.svg' },
}

function cardBrand(brand: string) {
  const known = CARD_BRANDS[brand.toLowerCase()]

  return {
    name: known?.name ?? 'Card',
    icon: `/payment_icons/${known?.icon ?? 'default.svg'}`,
  }
}

export function PaymentMethod({
  method,
}: {
  method: Nullable<PaymentMethodFragment>
}) {
  const [makeDefault, { loading: defaultLoading, error: defaultError }] =
    useDefaultPaymentMethodMutation({
      variables: { id: method?.id || '' },
      refetchQueries: [namedOperations.Query.Subscription],
      awaitRefetchQueries: true,
    })
  const [deleteMethod, { loading: deleteLoading, error: deleteError }] =
    useDeletePaymentMethodMutation({
      variables: { id: method?.id || '' },
      refetchQueries: [namedOperations.Query.Subscription],
      awaitRefetchQueries: true,
    })

  if (!method?.card) {
    return null
  }
  const { card } = method
  const brand = cardBrand(card.brand)
  const error = defaultError || deleteError

  return (
    <Flex
      direction="column"
      gap="small"
    >
      {error && <GqlError error={error} />}
      <Flex
        gap="medium"
        align="center"
      >
        <Flex
          align="center"
          gap="small"
        >
          <img
            width={48}
            src={brand.icon}
            alt={brand.name}
          />
          <Flex
            direction="column"
            gap="xxxsmall"
          >
            <Body1P css={{ fontWeight: 600 }}>
              {brand.name} ending in {card.last4}
            </Body1P>
            <Body2P $color="text-xlight">
              Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
            </Body2P>
          </Flex>
        </Flex>
        <Flex
          gap="small"
          align="center"
          justify="flex-end"
          grow={1}
        >
          {method.isDefault ? (
            <Chip severity="success">Default card</Chip>
          ) : (
            <Button
              small
              secondary
              loading={defaultLoading}
              onClick={() => makeDefault()}
            >
              Make default
            </Button>
          )}
          <DeleteIconButton
            tooltip="Delete"
            onClick={deleteLoading ? undefined : () => deleteMethod()}
          />
        </Flex>
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
      <PaymentForm onClose={onClose} />
    </Modal>
  )
}

function BillingBankCards({
  paymentMethods,
  invoices,
}: {
  paymentMethods: (PaymentMethodFragment | null | undefined)[]
  invoices?: (InvoiceFragment | null | undefined)[]
}) {
  const theme = useTheme()
  const [addPayment, setAddPayment] = useState(false)

  return (
    <Card
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.medium,
        padding: theme.spacing.medium,
      }}
    >
      <DelinquencyCallout invoices={invoices} />
      {isEmpty(paymentMethods) ? (
        <Body2P $color="text-xlight">No payment method saved</Body2P>
      ) : (
        paymentMethods.map((paymentMethod) => (
          <PaymentMethod
            key={paymentMethod?.id}
            method={paymentMethod}
          />
        ))
      )}
      <Flex justify="center">
        <Button onClick={() => setAddPayment(true)}>Add payment method</Button>
      </Flex>
      <AddPaymentMethodModal
        open={addPayment}
        onClose={() => setAddPayment(false)}
      />
    </Card>
  )
}

export default BillingBankCards
