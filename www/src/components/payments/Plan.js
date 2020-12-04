import React, { useState } from 'react'
import { Anchor, Box, Collapsible, Stack, Text } from 'grommet'
import { Cube, Group, Checkmark, Down, Next } from 'grommet-icons'

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

function SubscribedBadge() {
  return (
    <Box flex={false} width='25px' height='25px'
         background='brand' align='center' justify='center'>
      <Checkmark size='12px' />
    </Box>
  )
}

function Features({features, open}) {
  return (
    <Collapsible open={open}>
      <Box gap='small' pad={{vertical: 'small'}}>
        {features.map((feature) => <Feature key={feature.name} {...feature} />)}
      </Box>
    </Collapsible>
  )
}

export default function Plan({approvePlan, subscription, ...plan}) {
  const {name, cost, period, lineItems: {items, included}, metadata} = plan
  const [open, setOpen] = useState(false)
  const hasFeatures = metadata && metadata.features && metadata.features.length > 0
  const includedByDimension = included.reduce((byDim, val) => {
    byDim[val.dimension] = val
    return byDim
  }, {})

  const subscribed = subscription && subscription.plan.id === plan.id
  return (
    <Stack width='70%' anchor='top-right'>
      <Box pad='small' focusIndicator={false}
        border={{color: subscribed ? 'brand' : 'light-5'}} onClick={subscribed ? null : () => approvePlan(plan)}>
        <Box direction='row' align='center'>
          <Box gap='xsmall' fill='horizontal' direction='row'>
            <Text size='small' weight='bold'>{name}</Text>
            <Text size='small'>${cost /100} {period}</Text>
          </Box>
        </Box>
        <Box gap='xsmall' pad={{vertical: 'small'}}>
          {items.map((item) => <LineItem
                                key={item.dimension}
                                item={item}
                                included={includedByDimension[item.dimension]} />)}
        </Box>
        {hasFeatures && (
          <Box direction='row' gap='xsmall' align='center'>
            <Anchor size='small' onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open) }}>
              {open ? 'Hide' : 'Show'} features
            </Anchor>
            {open ? <Down size='small' /> : <Next size='small' />}
          </Box>
        )}
        {hasFeatures && (<Features features={metadata.features} open={open} />)}
      </Box>
    {subscribed && <SubscribedBadge />}
    </Stack>
  )
}