import { Chip, InfoOutlineIcon, Tooltip } from '@pluralsh/design-system'
import { CardHue } from '@pluralsh/design-system/dist/components/Card'
import { Flex } from 'honorable'
import moment from 'moment'
import { useEffect, useState } from 'react'

type QueueHealthProps = {
  pingedAt?: Date | null
  showTooltip?: boolean
  size?: 'small' | 'medium' | 'large'
  hue?: CardHue
}

export default function ClusterHealth({
  pingedAt,
  showTooltip = true,
  hue,
  size = 'medium',
}: QueueHealthProps) {
  const pinged = pingedAt !== null
  const healthy = useIsClusterHealthy(pingedAt)

  return (
    <Flex gap="xsmall">
      <Chip
        severity={pinged ? (healthy ? 'success' : 'danger') : 'warning'}
        size={size}
        hue={hue}
      >
        {pinged ? (healthy ? 'Healthy' : 'Unhealthy') : 'Pending'}
      </Chip>
      {pinged && !healthy && showTooltip && (
        <Tooltip
          label="Clusters that have recently been destroyed will show as Unhealthy while resources are cleaned up. All references should be removed within 24 hours."
          width={350}
        >
          <InfoOutlineIcon
            color="icon-default"
            cursor="help"
          />
        </Tooltip>
      )}
    </Flex>
  )
}

export function useIsClusterHealthy(pingedAt?: Date | null) {
  const [now, setNow] = useState(moment())

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [])

  return pingedAt && now.clone().subtract(2, 'hours').isBefore(pingedAt)
}
