import { useContext, useEffect, useMemo, useState } from 'react'
import { Box, ThemeContext } from 'grommet'
import { normalizeColor } from 'grommet/utils'
import moment from 'moment'

const DEFAULT_SIZE = '20px'

export function QueueHealth({ queue, size }) {
  const theme = useContext(ThemeContext)
  const [now, setNow] = useState(moment())
  const pinged = useMemo(() => moment(queue.pingedAt), [queue.pingedAt])
  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [queue.id])

  const healthy = now.subtract(2, 'minutes').isBefore(pinged)
  const color = normalizeColor(healthy ? 'good' : 'error', theme)

  return (
    <Box
      flex={false}
      round="full"
      width={size || DEFAULT_SIZE}
      height={size || DEFAULT_SIZE}
      background={color}
      style={{ boxShadow: `0 0 10px ${color}` }}
    />
  )
}
