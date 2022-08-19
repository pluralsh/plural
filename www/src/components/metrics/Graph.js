import { useMemo } from 'react'

import { Graph as SimpleGraph } from '../utils/Graph'

export const DURATIONS = [
  {
    offset: '1d', step: '1h', label: '1d', tick: 'every 1 hour',
  },
  {
    offset: '7d', step: '2h', label: '7d', tick: 'every 2 hours',
  },
  {
    offset: '30d', step: '1d', label: '30d', tick: 'every 1 day',
  },
  {
    offset: '60d', step: '1d', label: '60d', tick: 'every 1 day',
  },
  {
    offset: '120d', step: '1d', label: '120d', tick: 'every 1 day',
  },
]

export function Graph({ data, offset, precision }) {
  const tick = useMemo(() => {
    const dur = DURATIONS.find(({ offset: o, step }) => o === offset && precision === step)

    return dur || 'every 10 minutes'
  }, [offset, precision])

  return (
    <SimpleGraph
      data={data}
      tick={tick}
    />
  )
}
