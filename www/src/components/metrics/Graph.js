import { useMemo } from 'react'

import { Graph as SimpleGraph } from '../utils/Graph'

export const DURATIONS = [
  {
    offset: '7d', step: '2h', label: '7d', tick: 'every 12 hours',
  },
  {
    offset: '30d', step: '1d', label: '30d', tick: 'every 2 days',
  },
  {
    offset: '60d', step: '1d', label: '60d', tick: 'every 5 days',
  },
  {
    offset: '120d', step: '1d', label: '120d', tick: 'every 10 day',
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
