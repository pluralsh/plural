import React from 'react'
import { Box, Text } from 'grommet'
import { Checkmark, Cube, Group } from 'grommet-icons'
import { RepoIcon } from '../repos/Repositories'

function NoPlan() {
  return (
    <Box pad='small'>
      <Text size='small'>You're currently not on any plan for this repo</Text>
    </Box>
  )
}

function Feature({feature: {name, description}}) {
  return (
    <Box direction='row' gap='small' align='center'>
      <Checkmark size='15px' color='focus' />
      <Box gap='xsmall'>
        <Text size='small' weight={500}>{name}</Text>
        <Text size='small'><i>{description}</i></Text>
      </Box>
    </Box>
  )
}

function LineItemIcon({dimension, size}) {
  switch (dimension) {
    case 'user':
      return <Group size={size || '15px'} color='focus' />
    default:
      return <Cube size={size || '15px'} color='focus' />
  }
}

function LineItem({item: {name, dimension}, included: {quantity}, consumed}) {
  return (
    <Box direction='row' align='center' gap='xsmall'>
      <LineItemIcon dimension={dimension} />
      <Text size='small' weight='bold'>{name}</Text>
      <Text size='small'>{consumed}</Text>
      <Text size='small' color='dark-3'>({quantity} included)</Text>
    </Box>
  )
}

export function Subscription({incident: {repository, subscription}}) {
  if (!subscription) return <NoPlan />

  const {lineItems: {items}} = subscription
  const {plan: {name, lineItems: {included, ...lineItems}, metadata}} = subscription
  const includedByDimension = included.reduce((byDim, val) => ({...byDim, [val.dimension]: val}), {})
  const consumedByDimension = items.reduce((byDim, {quantity, dimension}) => ({...byDim, [dimension]: quantity}), {})
  const features = (metadata && metadata && metadata.features) || []

  return (
    <Box direction='row' gap='xsmall'>
      <Box pad='small' fill='vertical' align='center'> 
        <RepoIcon repo={repository} />
      </Box>
      <Box pad='small' gap='small'>
        <Text size='small' weight={500}>Subscribed to {name}</Text>
        <Box gap='xsmall'>
          {(lineItems.items || []).map((item) => <LineItem
                                  key={item.dimension}
                                  item={item}
                                  consumed={consumedByDimension[item.dimension]}
                                  included={includedByDimension[item.dimension]} />)}
        </Box>
        {features.map((feature) => <Feature key={feature.name} feature={feature} />)}
      </Box>
    </Box>
  )
}