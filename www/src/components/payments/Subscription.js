import React, { useState } from 'react'
import { Box, Text, Anchor, Layer } from 'grommet'
import { LineItemIcon } from './Plan'
import { subscriptionCost, updateSubscription, pivotByDimension } from './utils'
import { ModalHeader } from '../utils/Modal'
import NumericInput from '../utils/NumericInput'
import { useMutation } from 'react-apollo'
import { UPDATE_LINE_ITEM } from './queries'
import Button from '../utils/Button'

function LineItemUpdate({lineItem: {cost}, dimension, quantity, subscription, repository, setOpen}) {
  const [value, setValue] = useState(quantity)
  const [mutation, {loading}] = useMutation(UPDATE_LINE_ITEM, {
    variables: {subscriptionId: subscription.id, attributes: {dimension, quantity: value}},
    update: (cache, {data: {updateLineItem}}) => {
      updateSubscription(cache, repository.id, updateLineItem)
    }
  })
  return (
    <Layer modal position='center' onEsc={() => setOpen(false)}>
      <Box width='300px'>
        <ModalHeader text={`Update line item ${dimension}`} setOpen={setOpen} />
        <Box pad='medium' gap='small'>
          <Box direction='row' gap='small' align='center'>
            <NumericInput value={value} onChange={setValue} />
            <Text size='small'>${cost / 100} / {dimension}</Text>
          </Box>
          <Box direction='row' justify='end' align='center'>
            <Button
              loading={loading}
              label='Update'
              pad='small'
              round='xsmall'
              onClick={mutation} />
          </Box>
        </Box>
      </Box>
    </Layer>
  )
}

function LineItemNub({dimension, quantity, subscription, repository, lineItem}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      direction='row'
      gap='xsmall'
      align='center'>
      <LineItemIcon dimension={dimension} />
      <Text size='small'>{quantity} - {dimension}</Text>
      {hover && <Anchor size='small' onClick={() => setOpen(true)}>edit</Anchor>}
      {open && (
        <LineItemUpdate
          setOpen={setOpen}
          repository={repository}
          subscription={subscription}
          dimension={dimension}
          lineItem={lineItem}
          quantity={quantity} />)}
    </Box>
  )
}

export function SubscriptionBadge({repository, ...subscription}) {
  const {plan: {name, period, lineItems}, lineItems: {items}} = subscription
  const totalCost = subscriptionCost(subscription, subscription.plan)
  const itemsByDim = pivotByDimension(lineItems.items)

  return (
    <Box direction='row' border round='xsmall' pad='small'>
      <Box fill='horizontal' gap='xsmall'>
        <Text style={{fontWeight: 500}} size='small'>Subscribed to {name}</Text>
        {items.map(({dimension, quantity}) => (
          <LineItemNub
            key={dimension}
            repository={repository}
            subscription={subscription}
            lineItem={itemsByDim[dimension]}
            dimension={dimension}
            quantity={quantity} />)
        )}
      </Box>
      <Box width='30%' align='center' justify='center'>
        <Text color='green' size='small'>${totalCost / 100} {period}</Text>
      </Box>
    </Box>
  )
}