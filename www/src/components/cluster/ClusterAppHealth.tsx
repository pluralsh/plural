import { Chip } from '@pluralsh/design-system'
import moment from 'moment'
import { useEffect, useState } from 'react'

type ClusterAppHealthProps = {
    pingedAt?: Date | null
}

export default function ClusterAppHealth({ pingedAt }: ClusterAppHealthProps) {
  const [now, setNow] = useState(moment())

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 60_000)

    return () => clearInterval(int)
  }, [])

  const healthy = pingedAt && now.subtract(1, 'hour').isBefore(pingedAt)

  return (
    <Chip severity={healthy ? 'success' : 'error'}>
      {healthy ? 'Healthy' : 'Unhealthy'}
    </Chip>
  )
}
