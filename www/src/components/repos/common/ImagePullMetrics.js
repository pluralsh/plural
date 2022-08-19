import { Box } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { Graph } from 'components/utils/Graph'
import { useMemo } from 'react'
import moment from 'moment'
import { PageTitle, SubTab } from 'pluralsh-design-system'
import { DURATIONS } from 'components/metrics/Graph'

function RangePicker({ duration, setDuration }) {
  return (
    <Box direction="row">
      {DURATIONS.map((d, i) => (
        <SubTab
          key={i}
          active={duration.step === d.step && duration.offset === d.offset}
          onClick={() => setDuration(d)}
        >
          {d.label}
        </SubTab>
      ))}
    </Box>
  )
}

export default function ImagePullMetrics() {
  const { image: { dockerRepository }, filter, setFilter } = useOutletContext()
  const data = useMemo(() => dockerRepository.metrics.map(({ tags, values }) => {
    const tag = tags.find(({ name }) => name === 'tag')

    return {
      id: tag ? tag.value : dockerRepository.name,
      data: values.map(({ time, value }) => ({ x: moment(time).toDate(), y: value })),
    }
  }), [dockerRepository.metrics, dockerRepository.name])

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Pull metrics">
        <RangePicker
          duration={{ offset: filter.offset, step: filter.precision }}
          setDuration={({ offset, step }) => setFilter({ ...filter, offset, precision: step })}
        />
      </PageTitle>
      <Box
        overflow={{ vertical: 'hidden' }}
        height="350px"
      >
        <Graph
          data={data}
          precision={filter.precision}
          offset={filter.offset}
          tick="every hour"
        />
      </Box>
    </Box>
  )
}
