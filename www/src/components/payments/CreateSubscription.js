import React from 'react'
import { Layer, Box, Text } from 'grommet'
import { ModalHeader } from '../utils/Modal'
import { LineItem } from './Plan'

function PlanDisplay({name, cost, period, lineItems: {items, included}}) {
  const includedByDimension = included.reduce((byDim, val) => {
    byDim[val.dimension] = val
    return byDim
  }, {})

  return (
    <Box gap='xsmall'>
      <Text size='small' weight='bold'>{name}</Text>
      <Text size='small'>${cost /100} {period}</Text>
      <Box gap='xsmall' border='top' pad={{top: 'small'}}>
        <Text size='small' style={{fontWeight: 500}}>Add-ons:</Text>
        {items.map((item) => <LineItem
                              key={item.dimension}
                              item={item}
                              included={includedByDimension[item.dimension]} />)}
      </Box>
    </Box>
  )
}

export default function SubscribeModal({plan, repositoryId, items, setOpen}) {

  return (
    <Layer modal position='center' onEsc={() => setOpen(false)}>
      <Box width='60vw'>
        <ModalHeader text='Do you want to subscribe to this plan?' setOpen={setOpen} />
        <Box pad='small' gap='small'>
          <PlanDisplay plan={plan} />
        </Box>
      </Box>
    </Layer>
  )
}