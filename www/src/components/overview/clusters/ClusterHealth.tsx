import { Chip, InfoOutlineIcon, Tooltip } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import moment from 'moment'
import { useEffect, useState } from 'react'

type QueueHealthProps = {
    pingedAt?: Date | null
    size?: 'small' | 'medium' | 'large'
}

export default function ClusterHealth({ pingedAt, size = 'medium' }: QueueHealthProps) {
  const [now, setNow] = useState(moment())

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [])

  const healthy = pingedAt && now.clone().subtract(2, 'minutes').isBefore(pingedAt)

  return (
    <Flex gap="xsmall">
      <Chip
        severity={healthy ? 'success' : 'error'}
        size={size}
      >
        {healthy ? 'Healthy' : 'Unhealthy'}
      </Chip>
      {!healthy && (
        <Tooltip
          label="Clusters that have recently been destroyed will show as Unhealthy while resources are cleaned up. All references should be removed within 24 hours."
          width={350}
        >
          <InfoOutlineIcon cursor="help" />
        </Tooltip>
      )}
    </Flex>
  )
}
