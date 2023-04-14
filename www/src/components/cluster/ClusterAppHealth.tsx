import { Chip } from '@pluralsh/design-system'
import { ChipProps } from '@pluralsh/design-system/dist/components/Chip'
import moment from 'moment'
import { useEffect, useState } from 'react'

type ClusterAppHealthProps = {
    pingedAt?: Date | null
} & ChipProps

export default function ClusterAppHealth({ pingedAt, ...props }: ClusterAppHealthProps) {
  const [now, setNow] = useState(moment())

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [])

  const healthy = pingedAt && now.clone().subtract(1, 'hour').isBefore(pingedAt)

  return (
    <Chip
      severity={healthy ? 'success' : 'error'}
      {...props}
    >
      {healthy ? 'Healthy' : 'Unhealthy'}
    </Chip>
  )
}
