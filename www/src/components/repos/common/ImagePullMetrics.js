import { Box } from 'grommet'

import { useOutletContext } from 'react-router-dom'

import { Graph } from 'components/utils/Graph'
import { useMemo, useRef } from 'react'
import moment from 'moment'
import {
  PageTitle, SubTab, TabList, TabPanel,
} from 'pluralsh-design-system'
import { DURATIONS } from 'components/metrics/Graph'

function RangePicker({ duration, setDuration }) {
  const tabStateRef = useRef()
  const selectedKey = `${duration.offset}+${duration.step}`

  return (
    <TabList
      stateRef={tabStateRef}
      stateProps={{
        orientation: 'horizontal',
        selectedKey,
        onSelectionChange: key => {
          const dur = DURATIONS.find(d => key === `${d.offset}+${d.step}`)

          if (dur) setDuration(dur)
        },
      }}
    >
      {DURATIONS.map(d => (
        <SubTab
          key={`${d.offset}+${d.step}`}
          textValue={d.label}
        >
          {d.label}
        </SubTab>
      ))}
    </TabList>
  )
}

export default function ImagePullMetrics() {
  const {
    image: { dockerRepository },
    filter,
    setFilter,
  } = useOutletContext()
  const data = useMemo(() => dockerRepository.metrics.map(({ tags, values }) => {
    const tag = tags.find(({ name }) => name === 'tag')

    return {
      id: tag ? tag.value : dockerRepository.name,
      data: values.map(({ time, value }) => ({
        x: moment(time).toDate(),
        y: value,
      })),
    }
  }),
  [dockerRepository.metrics, dockerRepository.name])
  const tabStateRef = useRef()

  return (
    <Box
      fill
      flex={false}
      gap="small"
    >
      <PageTitle heading="Pull metrics">
        <RangePicker
          tabStateRef={tabStateRef}
          duration={{ offset: filter.offset, step: filter.precision }}
          setDuration={({ offset, step, tick }) => setFilter({
            ...filter,
            offset,
            precision: step,
            tick,
          })}
        />
      </PageTitle>
      <TabPanel
        stateRef={tabStateRef}
        as={(
          <Box
            overflow={{ vertical: 'hidden' }}
            height="350px"
          />
        )}
      >
        <Graph
          data={data}
          precision={filter.precision}
          offset={filter.offset}
          tick={filter.tick}
        />
      </TabPanel>
    </Box>
  )
}
