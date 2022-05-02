import { useState } from 'react'
import { Anchor, Box, Layer, Text } from 'grommet'
import { Button, Reload as Refresh } from 'forge-core'
import { useMutation } from '@apollo/client'

import { NumericInput } from '../utils/NumericInput'
import { deepUpdate, updateCache } from '../../utils/graphql'
import { REPO_Q } from '../repos/queries'
import { ModalHeader } from '../ModalHeader'

import { PlanType } from './types'
import { UPDATE_LINE_ITEM } from './queries'
import { pivotByDimension, subscriptionCost } from './utils'
import { LineItemIcon } from './Plan'

function LineItemUpdate({ lineItem: { cost }, dimension, quantity, subscription, repository, setOpen }) {
  const [value, setValue] = useState(quantity)
  const [mutation, { loading }] = useMutation(UPDATE_LINE_ITEM, {
    variables: { subscriptionId: subscription.id, attributes: { dimension, quantity: value } },
    update: (cache, { data: { updateLineItem } }) => updateCache(cache, {
      query: REPO_Q,
      variables: { repositoryId: repository.id },
      update: prev => deepUpdate(prev, 'repository.installation.subscription', () => updateLineItem),
    }),
  })

  return (
    <Layer
      modal
      position="center"
      onEsc={() => setOpen(false)}
    >
      <Box width="300px">
        <ModalHeader
          text={`Update line item: ${dimension}`}
          setOpen={setOpen}
        />
        <Box
          direction="row"
          pad="medium"
          gap="small"
        >
          <Box
            direction="row"
            gap="small"
            align="center"
            flex={false}
          >
            <NumericInput
              value={value}
              onChange={setValue}
            />
            <Text size="small">(${cost / 100} / {dimension})</Text>
          </Box>
          <Box
            direction="row"
            fill="horizontal"
            justify="end"
            align="center"
          >
            <Button
              loading={loading}
              label="Update"
              onClick={mutation}
            />
          </Box>
        </Box>
      </Box>
    </Layer>
  )
}

export function LineItemNub({ dimension, quantity, subscription, repository, lineItem }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const metered = lineItem.type === PlanType.METERED

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      direction="row"
      gap="xsmall"
      align="center"
    >
      <LineItemIcon dimension={dimension} />
      {!metered && <Text size="small">{quantity} - {dimension}</Text>}
      {metered && <Text size="small">{dimension}</Text>}
      {metered && <Refresh size="small" />}
      {hover && !metered && (
        <Anchor
          size="small"
          onClick={() => setOpen(true)}
        >edit
        </Anchor>
      )}
      {open && (
        <LineItemUpdate
          setOpen={setOpen}
          repository={repository}
          subscription={subscription}
          dimension={dimension}
          lineItem={lineItem}
          quantity={quantity}
        />
      )}
    </Box>
  )
}

export function SubscriptionBadge({ repository, subscription }) {
  const { plan: { name, period, lineItems }, lineItems: { items } } = subscription
  const totalCost = subscriptionCost(subscription, subscription.plan)
  const itemsByDim = pivotByDimension(lineItems.items)

  return (
    <Box
      direction="row"
      border={{ color: 'border' }}
      round="xsmall"
      pad="small"
    >
      <Box
        fill="horizontal"
        gap="xsmall"
      >
        <Text
          weight={500}
          size="small"
        >Subscribed to {name}
        </Text>
        {items.map(({ dimension, quantity }) => (
          <LineItemNub
            key={dimension}
            repository={repository}
            subscription={subscription}
            lineItem={itemsByDim[dimension]}
            dimension={dimension}
            quantity={quantity}
          />
        )
        )}
      </Box>
      <Box
        width="30%"
        align="center"
        justify="center"
      >
        <Text
          color="green"
          size="small"
        >${totalCost / 100} {period}
        </Text>
      </Box>
    </Box>
  )
}
