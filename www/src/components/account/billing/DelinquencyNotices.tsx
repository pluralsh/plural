import { Button, Toast } from '@pluralsh/design-system'
import { Flex, P } from 'honorable'
import { Link } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { LocalStorageKeys } from '../../../constants'
import usePersistedState from '../../../hooks/usePersistedState'

import { useBillingSubscription } from './BillingSubscriptionProvider'

type NotificationState =
  | {
      lastDismissedDelinquentAt: string
    }
  | null
  | undefined

export function DelinquencyNotice() {
  const theme = useTheme()

  console.log('delinquencyNotice')
  const { account, isDelinquent } = useBillingSubscription()

  const [notificationState, setNotificationState]
    = usePersistedState<NotificationState>(LocalStorageKeys.DelinquencyNotice, {
      lastDismissedDelinquentAt: '',
    })
  const delinquentAt = account?.delinquentAt?.toString() || ''

  if (!isDelinquent) {
    return null
  }
  const onClose = () => {
    console.log('onclose')
    setNotificationState({
      lastDismissedDelinquentAt: account?.delinquentAt?.toString() ?? '',
    })
  }

  const showToast
    = isDelinquent
    && notificationState?.lastDismissedDelinquentAt !== delinquentAt

  return (
    <Toast
      severity="error"
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
        <P
          body2
          color="text-xlight"
        >
          Update payment information to retain full account access.
        </P>
        <Flex>
          <Button
            primary
            as={Link}
            textDecoration="none !important"
            color={`${theme.colors.text} !important`}
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
