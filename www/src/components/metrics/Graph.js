import React, { useMemo } from 'react'
import { Box, Text } from 'grommet'
import { Graph as SimpleGraph } from '../utils/Graph'

export const DURATIONS = [
  {offset: '1h', step: '10m', label: '1h', tick: 'every 10 minutes'},
  {offset: '2h', step: '10m', label: '2h', tick: 'every 10 minutes'},
  {offset: '6h', step: '20m', label: '6h', tick: 'every 20 minutes'},
  {offset: '1d', step: '1h', label: '1d', tick: 'every 1 hour'},
  {offset: '7d', step: '2h', label: '7d', tick: 'every 2 hours'},
]

function RangeOption({duration, current, setDuration, first, last}) {
  const selected = duration.offset === current.offset && duration.step === current.step
  return (
    <Box round={(first || last) ? {corner: (first ? 'left' : 'right'), size: 'xsmall'} : null}
      pad='small' align='center' justify='center' focusIndicator={false}
      background={selected ? 'light-3' : null} hoverIndicator='light-2'
      onClick={() => setDuration(duration)}>
      <Text size='small' weight={selected ? 'bold' : null}>{duration.label}</Text>
    </Box>
  )
}

export function RangePicker({duration, setDuration}) {
  const count = DURATIONS.length
  return (
    <Box round='xsmall' border={{color: 'light-5'}} flex={false}>
      <Box direction='row' round='xsmall' gap='0px' border={{side: 'between', color: 'light-5'}}>
        {DURATIONS.map((dur, ind) => (
          <RangeOption
            key={ind}
            duration={dur}
            current={duration}
            first={ind === 0}
            last={ind === count - 1}
            setDuration={setDuration} />))}
      </Box>
    </Box>
  )
}

export function Graph({data, offset, precision}) {
  const tick = useMemo(() => {
    const dur = DURATIONS.find(({offset: o, step}) => o === offset && precision === step)
    return dur || 'every 10 minutes'
  }, [offset, precision])

  
  return <SimpleGraph data={data} tick={tick} />
}