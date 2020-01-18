import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import { Cube, Group } from 'grommet-icons'
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

export default function Plan({approvePlan, ...plan}) {
  const {name, cost, period, lineItems: {items, included}} = plan
  const [hover, setHover] = useState(false)
  const includedByDimension = included.reduce((byDim, val) => {
    byDim[val.dimension] = val
    return byDim
  }, {})

  return (
    <Container
      style={{cursor: 'pointer'}}
      pad='medium'
      gap='xsmall'
      onClick={() => approvePlan(plan)}
      hover={hover}
      setHover={setHover}>
      <Text size='small' weight='bold'>{name}</Text>
      <Text size='small'>${cost /100} {period}</Text>
      <Box gap='xsmall' border='top' pad={{top: 'small'}}>
        <Text size='small' style={{fontWeight: 500}}>Add-ons:</Text>
        {items.map((item) => <LineItem
                              key={item.dimension}
                              item={item}
                              included={includedByDimension[item.dimension]} />)}
      </Box>
    </Container>
  )
}