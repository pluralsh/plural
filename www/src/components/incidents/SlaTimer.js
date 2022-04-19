import moment from 'moment'
import { BeatLoader } from 'react-spinners'
import { Box, Text } from 'grommet'
import Countdown from 'react-countdown'

function SlaBreached() {
  return (
    <Box
      round="xsmall"
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      background="error"
    >
      <Text size="small">SLA breached</Text>
    </Box>
  )
}

const pad = v => v < 10 ? `0${v}` : v

function RenderCountdown({ hours, minutes, seconds, completed }) {
  if (completed) return <SlaBreached />

  return (
    <Box
      flex={false}
      round="xsmall"
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      background="progress"
      direction="row"
      gap="small"
      align="center"
    >
      <Text size="small"><b>{hours}:{pad(minutes)}:{pad(seconds)}</b> to respond</Text>
      <BeatLoader
        size={5}
        margin={2}
        color="white"
      />
    </Box>
  )
}

export function SlaTimer({ incident: { nextResponseAt } }) {
  if (!nextResponseAt) return null

  const converted = moment(nextResponseAt).toDate()

  return (
    <Countdown
      date={converted}
      renderer={RenderCountdown}
    />
  )
}
