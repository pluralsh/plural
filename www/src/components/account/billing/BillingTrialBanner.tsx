import { Callout } from '@pluralsh/design-system'
import { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

const Wrap = styled.div(({ theme }) => ({
  marginBottom: theme.spacing.large,
}))

const Message = styled.p(({ theme }) => ({
  ...theme.partials.text.body2,
  color: theme.colors['text-xlight'],
}))

const MessageLink = styled.a(({ theme }) => ({
  ...theme.partials.text.inlineLink,
}))

function BillingTrialBanner() {
  const {
    isTrialExpired,
    isPaidPlan,
    isTrialExpiringSoon,
    isTrialed,
    isTrialPlan,
  } = useContext(SubscriptionContext)
  const shouldDisplayBanner = useMemo(
    () => (isTrialPlan && isTrialExpiringSoon) || (isTrialed && !isPaidPlan),
    [isPaidPlan, isTrialExpiringSoon, isTrialPlan, isTrialed]
  )
  const message = useMemo(
    () =>
      isTrialExpired ? 'Free trial expired. ' : 'Free trial expiring soon. ',
    [isTrialExpired]
  )

  if (!shouldDisplayBanner) return null

  return (
    <Wrap>
      <Callout
        severity={isTrialExpiringSoon || isTrialExpired ? 'danger' : 'warning'}
        title={message}
        closed={false}
      >
        <Message>
          Your free trial {isTrialExpired ? 'has expired' : 'is expiring soon'}.
          Upgrade to Plural Professional to&nbsp;
          {isTrialExpired ? 'reactivate' : 'maintain'} full feature
          access.&nbsp;
          <MessageLink
            as={Link}
            to="/account/billing?upgrade=true"
          >
            Upgrade now.
          </MessageLink>
        </Message>
      </Callout>
    </Wrap>
  )
}

export default BillingTrialBanner
