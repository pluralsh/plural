import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import { Cube } from 'grommet-icons'
import { Container } from '../repos/Integrations'

export function LineItem({item: {cost, name, dimension}, included: {quantity}}) {
  return (
    <Box direction='row' align='center' gap='xsmall'>
      <Cube size='15px' color='focus' />
      <Text size='small' weight='bold'>{name}</Text>
      <Text size='small'>${cost / 100} / {dimension}</Text>
      <Text size='small' color='dark-3'>({quantity} included)</Text>
    </Box>
  )
}

export default function Plan({name, cost, period, lineItems: {items, included}}) {
  const [hover, setHover] = useState(false)
  const includedByDimension = included.reduce((byDim, val) => {
    byDim[val.dimension] = val
    return byDim
  }, {})

  return (
    <Container pad='medium' gap='xsmall' hover={hover} setHover={setHover}>
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