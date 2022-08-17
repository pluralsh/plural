import { ThemeContext } from 'grommet'
import { Div, Flex } from 'honorable'
import moment from 'moment'
import {
  Chip, ListBoxItem, PageCard, Select,
} from 'pluralsh-design-system'
import {
  Dispatch, ReactElement, useContext, useEffect, useMemo, useState,
} from 'react'

import QueueContext from '../../contexts/QueueContext'
import { providerToURL } from '../repos/misc'

// TODO: This should not be needed once Clusters.js file gets removed
// @ts-ignore
import { Queue } from './Clusters.tsx'

export function ClustersSidenav({
  onQueueChange,
  queues,
}: { onQueueChange: Dispatch<Queue>, queues: Array<Queue> }): ReactElement {
  const queue: Queue = useContext(QueueContext)
  const [selectedKey, setSelectedKey] = useState<Queue>(queues.length > 0 ? queues[0] : undefined)

  const onSelectionChange = id => {
    const queue = queues.find(q => q.id === id)

    setSelectedKey(queue)
    onQueueChange(queue)
  }

  return (
    <Flex
      gap={24}
      direction="column"
      paddingVertical="large"
      width={240}
    >
      <ProfileCard queue={queue} />
      <Div paddingLeft="medium">
        <Select
          label="Select cluster"
          selectedKey={selectedKey?.id}
          onSelectionChange={onSelectionChange}
          rightContent={selectedKey && <QueueHealth queue={selectedKey} />}
        >
          {queues.map(queue => (
            <ListBoxItem
              key={queue.id}
              label={queue.name}
              textValue={queue.id}
              rightContent={<QueueHealth queue={queue} />}
            />
          ))}
        </Select>
      </Div>
    </Flex>
  )
}

function ProfileCard({ queue }: { queue: Queue }): ReactElement {
  const { dark } = useContext(ThemeContext) as { dark }
  const url = providerToURL(queue?.provider, dark)

  return (
    <PageCard
      heading={queue?.name}
      subheading={queue?.provider}
      icon={{ url }}
    />
  )
}

function QueueHealth({ queue }: { queue: Queue }) {
  const [now, setNow] = useState(moment())
  const pinged = useMemo(() => moment(queue.pingedAt), [queue.pingedAt])

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [queue.id])

  const healthy = now.subtract(2, 'minutes').isBefore(pinged)

  return (
    <Chip
      severity={healthy ? 'success' : 'error'}
    >
      {healthy ? 'Healthy' : 'Unhealthy'}
    </Chip>
  )
}
