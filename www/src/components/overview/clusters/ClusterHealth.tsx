import { Chip } from '@pluralsh/design-system'
import moment from 'moment'
import { useEffect, useState } from 'react'

type QueueHealthProps = {
    pingedAt?: Date | null
}

export default function ClusterHealth({ pingedAt }: QueueHealthProps) {
  const [now, setNow] = useState(moment())

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [])

  const healthy = pingedAt && now.clone().subtract(2, 'minutes').isBefore(pingedAt)

  return (
    <Chip severity={healthy ? 'success' : 'error'}>
      {healthy ? 'Healthy' : 'Unhealthy'}
    </Chip>
  )
}
