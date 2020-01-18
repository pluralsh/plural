import React from 'react'
import { Box, Text } from 'grommet'
import { LineItemIcon } from './Plan'
import { subscriptionCost } from './utils'

function LineItemNub({dimension, quantity}) {
  return (
    <Box direction='row' gap='xsmall' align='center'>
      <LineItemIcon dimension={dimension} />
      <Text size='small'>{quantity} - {dimension}</Text>
    </Box>
  )
}

export function SubscriptionBadge(subscription) {
  const {plan: {name, period}, lineItems: {items}} = subscription
  const totalCost = subscriptionCost(subscription, subscription.plan)

  return (
    <Box direction='row' border round='xsmall' pad='small'>
      <Box fill='horizontal' gap='xsmall'>
        <Text style={{fontWeight: 500}} size='small'>Subscribed to {name}</Text>
        {items.map(({dimension, quantity}) => <LineItemNub dimension={dimension} quantity={quantity} />)}
      </Box>
      <Box width='30%' align='center' justify='center'>
        <Text color='green' size='small'>${totalCost / 100} {period}</Text>
      </Box>
    </Box>
  )
}