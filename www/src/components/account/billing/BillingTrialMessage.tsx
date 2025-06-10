import { ErrorIcon, IconFrame, WarningIcon } from '@pluralsh/design-system'
import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

const Wrap = styled.div({ display: 'flex', alignItems: 'center' })

const Message = styled.p(({ theme }) => ({
  ...theme.partials.text.overline,
  color: theme.colors['text-xlight'],
}))

const MessageLink = styled.a(({ theme }) => ({
  ...theme.partials.text.inlineLink,
}))

function BillingTrialMessage() {
  const theme = useTheme()
  const {
    isTrialExpired,
    isPaidPlan,
    isTrialed,
    isTrialPlan,
    isTrialExpiringSoon,
    daysUntilTrialExpires,
  } = useContext(SubscriptionContext)
  const shouldDisplayMessage = useMemo(
    () => isTrialPlan || (isTrialed && !isPaidPlan),
    [isPaidPlan, isTrialPlan, isTrialed]
  )
  const message = useMemo(
    () =>
      isTrialExpired
        ? 'Free trial expired. '
        : isTrialExpiringSoon
        ? 'Free trial expiring soon. '
        : `Free trial expires in ${daysUntilTrialExpires} days. `,
    [isTrialExpired, isTrialExpiringSoon, daysUntilTrialExpires]
  )

  if (!shouldDisplayMessage) return null

  return (
    <Wrap>
      {(isTrialExpired || isTrialExpiringSoon) && (
        <IconFrame
          icon={<ErrorIcon color={theme.colors['icon-danger']} />}
          textValue={message}
        />
      )}
      {!isTrialExpired && !isTrialExpiringSoon && (
        <IconFrame
          icon={<WarningIcon color="icon-warning" />}
          textValue={message}
        />
      )}
      <Message>
        {message}
        <MessageLink
          as={Link}
          to="/account/billing"
        >
          {isTrialExpired ? 'reactivate full access' : 'upgrade now'}
        </MessageLink>
      </Message>
    </Wrap>
  )
}

export default BillingTrialMessage
