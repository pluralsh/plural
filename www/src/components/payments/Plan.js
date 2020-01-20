import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import { Cube, Group, Checkmark, Cycle } from 'grommet-icons'
import { Container } from '../repos/Integrations'

export function LineItemIcon({dimension, size}) {
  switch (dimension) {
    case 'user':
      return <Group size={size || '15px'} color='focus' />
    default:
      return <Cube size={size || '15px'} color='focus' />
  }
}

export function LineItem({item: {cost, name, dimension}, included: {quantity}}) {
  return (
    <Box direction='row' align='center' gap='xsmall'>
      <LineItemIcon dimension={dimension} />
      <Text size='small' weight='bold'>{name}</Text>
      <Text size='small'>${cost / 100} / {dimension}</Text>
      <Text size='small' color='dark-3'>({quantity} included)</Text>
    </Box>
  )
}

function Feature({name, description}) {
  return (
    <Box direction='row' gap='small' align='center'>
      <Checkmark size='15px' color='focus' />
      <Box gap='xsmall'>
        <Text size='small' style={{fontWeight: 500}}>{name}</Text>
        <Text size='small'><i>{description}</i></Text>
      </Box>
    </Box>
  )
}

export default function Plan({approvePlan, subscription, ...plan}) {
  const {name, cost, period, lineItems: {items, included}, metadata} = plan
  const [hover, setHover] = useState(false)
  const includedByDimension = included.reduce((byDim, val) => {
    byDim[val.dimension] = val
    return byDim
  }, {})

  const subscribed = subscription && subscription.plan.id === plan.id
  return (
    <Container
      style={subscribed ? {maxWidth: '70%'} : {cursor: 'pointer', maxWidth: '70%'}}
      pad='medium'
      gap='xsmall'
      onClick={() => !subscribed && approvePlan(plan)}
      hover={!subscribed && hover}
      setHover={setHover}>
      <Box direction='row' align='center'>
        <Box gap='xsmall' fill='horizontal'>
          <Text size='small' weight='bold'>{name}</Text>
          <Text size='small'>${cost /100} {period}</Text>
        </Box>
        {subscribed && <Cycle size='15px' />}
      </Box>
      <Box gap='xsmall' border='top' pad={{vertical: 'small'}}>
        <Text size='small' style={{fontWeight: 500}}>Add-ons:</Text>
        {items.map((item) => <LineItem
                              key={item.dimension}
                              item={item}
                              included={includedByDimension[item.dimension]} />)}
      </Box>
      {metadata && metadata.features && metadata.features.length > 0 && (
        <Box gap='small' border='top' pad={{vertical: 'small'}}>
          <Text size='small' style={{fontWeight: 500}}>Additional features:</Text>
          {metadata.features.map((feature) => <Feature key={feature.name} {...feature} />)}
        </Box>
      )}
    </Container>
  )
}