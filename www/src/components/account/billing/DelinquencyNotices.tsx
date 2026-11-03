import {
  Button,
  Callout,
  CalloutProps,
  Flex,
  Toast,
} from '@pluralsh/design-system'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { LocalStorageKeys } from '../../../constants'
import { InvoiceFragment } from '../../../generated/graphql'
import usePersistedState from '../../../hooks/usePersistedState'
import { Body2P } from '../../utils/Typography'

import { useBillingSubscription } from './BillingSubscriptionProvider'

type NotificationState =
  | {
      lastDismissedDelinquentAt: string
    }
  | null
  | undefined

export function DelinquencyCallout({
  invoices,
  ...props
}: CalloutProps & { invoices?: (InvoiceFragment | null | undefined)[] }) {
  const { isDelinquent } = useBillingSubscription()

  if (!isDelinquent) {
    return null
  }
  const openInvoice = invoices?.find(
    (invoice) => invoice?.status?.toLowerCase() === 'open'
  )
  const invoiceLink = openInvoice?.hostedInvoiceUrl

  return (
    <Callout
      severity="danger"
      size="compact"
      {...props}
    >
      Payment failed.{' '}
      {invoiceLink ? (
        <>
          Complete your payment{' '}
          <a
            href={invoiceLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>{' '}
          to retain full account access.
        </>
      ) : (
        'Update payment information to retain full account access.'
      )}
    </Callout>
  )
}

export function DelinquencyToast() {
  const theme = useTheme()
  const { account, isDelinquent } = useBillingSubscription()
  const [notificationState, setNotificationState] =
    usePersistedState<NotificationState>(LocalStorageKeys.DelinquencyNotice, {
      lastDismissedDelinquentAt: '',
    })
  const onClose = useCallback(() => {
    setNotificationState({
      lastDismissedDelinquentAt: account?.delinquentAt?.toString() ?? '',
    })
  }, [account?.delinquentAt, setNotificationState])

  if (!isDelinquent) {
    return null
  }
  const delinquentAt = account?.delinquentAt?.toString() || ''
  const showToast =
    isDelinquent &&
    notificationState?.lastDismissedDelinquentAt !== delinquentAt

  return (
    <Toast
      severity="danger"
      marginBottom="medium"
      marginRight="xxxxlarge"
      closeTimeout="none"
      show={showToast}
      onClose={onClose}
      heading="Payment failed"
    >
      <Flex
        direction="column"
        gap="small"
      >
        <Body2P $color="text-xlight">
          Update payment information to retain full account access.
        </Body2P>
        <Flex>
          <Button
            primary
            as={Link}
            css={{
              textDecoration: 'none !important',
              color: `${theme.colors.text} !important`,
            }}
            to="/account/billing/payments"
            onClick={() => {
              onClose()
            }}
          >
            Update now
          </Button>
        </Flex>
      </Flex>
    </Toast>
  )
}
