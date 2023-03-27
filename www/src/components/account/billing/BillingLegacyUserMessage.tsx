import { useContext } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { ErrorIcon, IconFrame } from '@pluralsh/design-system'
import { Link } from 'react-router-dom'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

const Wrap = styled.div({ display: 'flex', alignItems: 'center' })

const Message = styled.p(({ theme }) => ({
  ...theme.partials.text.overline,
  color: theme.colors['text-xlight'],
}))

const MessageLink = styled.a(({ theme }) => ({ ...theme.partials.text.inlineLink }))

function BillingLegacyUserMessage() {
  const {
    isPaidPlan, isGrandfathered, isGrandfathetingExpired, account,
  } = useContext(SubscriptionContext)

  if (isPaidPlan || !(isGrandfathered || isGrandfathetingExpired)) return null

  const message = isGrandfathetingExpired
    ? 'Legacy user access expired. '
    : `Legacy user access until ${moment(account?.grandfatheredUntil).format('MMM DD, YYYY')}. `

  return (
    <Wrap>
      {isGrandfathetingExpired && (
        <IconFrame
          icon={<ErrorIcon color="icon-error" />}
          textValue={message}
        />
      )}
      <Message>
        {message}
        <MessageLink
          as={Link}
          to="/account/billing"
        >
          upgrade now
        </MessageLink>
      </Message>
    </Wrap>
  )
}

export default BillingLegacyUserMessage

