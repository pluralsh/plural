import { useState } from 'react'
import { Box, Layer, Text } from 'grommet'
import { Button, NumericInput } from 'forge-core'
import { Add } from 'grommet-icons'
import { useMutation } from '@apollo/client'

import { deepUpdate } from '../../utils/graphql'

import { REPO_Q } from '../repos/queries'

import { ModalHeader } from '../ModalHeader'

import { CREATE_SUBSCRIPTION } from './queries'
import { pivotByDimension, subscriptionCost } from './utils'
import { PlanType } from './types'

function LineItemInput({ item: { dimension, name, cost }, included, updateItem }) {
  return (
    <Box
      direction="row"
      gap="xsmall"
      align="center"
    >
      <Add size="15px" />
      <NumericInput
        margin={{ horizontal: 'xsmall' }}
        value={0}
        onChange={value => updateItem(dimension, value)}
      />
      <Text
        size="small"
        weight="bold"
      >{name}
      </Text>
      <Text size="small">at ${cost / 100} / {dimension}</Text>
      <Text
        size="small"
        color="dark-3"
      >({included.quantity} included in base plan)
      </Text>
    </Box>
  )
}

function PlanForm({ plan: { name, cost, period, lineItems: { items, included } }, attributes, setAttributes }) {
  const includedByDimension = pivotByDimension(included)

  function updateItem(dimension, quantity) {
    setAttributes(deepUpdate(
      attributes,
      'lineItems.items',
      items => items.map(item => (item.dimension === dimension ? { dimension, quantity } : item))
    ))
  }

  return (
    <Box gap="xsmall">
      <Box
        pad={{ horizontal: 'medium', vertical: 'small' }}
        border="bottom"
        gap="xsmall"
      >
        <Box
          direction="row"
          gap="small"
        >
          <Text
            size="small"
            weight="bold"
          >{name}
          </Text>
          <Text size="small">${cost / 100} {period}</Text>
        </Box>
        {items.filter(({ type }) => type === PlanType.LICENSED)
              .map(item => (
                <LineItemInput
                  key={item.dimension}
                  item={item}
                  included={includedByDimension[item.dimension]}
                  updateItem={updateItem}
                />
              ))}
      </Box>
    </Box>
  )
}

export function Subscriber({ plan, installationId, repositoryId, setOpen }) {
  const [attributes, setAttributes] = useState({
    lineItems: { items: plan.lineItems.items.map(({ dimension }) => ({ dimension, quantity: 0 })) },
  })

  const [mutation, { loading }] = useMutation(CREATE_SUBSCRIPTION, {
    variables: { installationId, attributes, planId: plan.id },
    refetchQueries: [{ query: REPO_Q, variables: { repositoryId } }],
    onCompleted: () => setOpen(false),
  })
  const total = subscriptionCost(attributes, plan)

  return (
    <Box
      pad="small"
      gap="small"
    >
      <PlanForm
        plan={plan}
        attributes={attributes}
        setAttributes={setAttributes}
      />
      <Box
        direction="row"
        justify="end"
        gap="small"
        align="center"
      >
        <Text>Total</Text>
        <Text color="green">${total / 100}</Text>
        <Button
          loading={loading}
          round="xsmall"
          label="Subscribe"
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

export default function SubscribeModal({ plan, installationId, repositoryId, setOpen }) {
  return (
    <Layer
      modal
      position="center"
      onEsc={() => setOpen(false)}
    >
      <Box width="40vw">
        <ModalHeader
          text={`Subscribe to the ${plan.name} plan?`}
          setOpen={setOpen}
        />
        <Subscriber
          plan={plan}
          installationId={installationId}
          repositoryId={repositoryId}
          setOpen={setOpen}
        />
      </Box>
    </Layer>
  )
}
