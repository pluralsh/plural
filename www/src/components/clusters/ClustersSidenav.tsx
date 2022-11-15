import { ThemeContext } from 'grommet'
import { Div, Flex } from 'honorable'
import truncate from 'lodash/truncate'
import moment from 'moment'
import {
  Chip,
  ListBoxItem,
  PageCard,
  Select,
} from '@pluralsh/design-system'
import {
  Dispatch,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import QueueContext from '../../contexts/QueueContext'
import { providerToURL } from '../repos/misc'

import { Queue } from './Clusters'

export function ClustersSidenav({
  onQueueChange,
  queues,
}: { onQueueChange: Dispatch<Queue | undefined>, queues: Array<Queue> }): ReactElement {
  const queue: Queue = useContext(QueueContext)
  const [selectedKey, setSelectedKey] = useState<Queue | undefined>(queues.length > 0 ? queues[0] : undefined)

  const onSelectionChange = id => {
    const queue = queues.find(q => q.id === id)

    setSelectedKey(queue)
    onQueueChange(queue)
  }

  // Update selected queue if queues are updated
  useEffect(() => {
    const queue = queues.find(q => q.id === selectedKey?.id)

    setSelectedKey(queue)
  }, [queues, selectedKey, setSelectedKey])

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
        >
          {queues.map(queue => (
            <ListBoxItem
              key={queue.id}
              label={truncate(queue.name, { length: 14 })}
              textValue={queue.name}
              rightContent={(
                <QueueHealth
                  queue={queue}
                  short
                />
              )}
            />
          ))}
        </Select>
        {selectedKey && <Div marginTop="xsmall"><QueueHealth queue={selectedKey} /></Div>}
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

function QueueHealth({ queue, short = false }: { queue: Queue, short?: boolean }) {
  const [now, setNow] = useState(moment())
  const pinged = useMemo(() => moment(queue.pingedAt), [queue.pingedAt])

  useEffect(() => {
    const int = setInterval(() => setNow(moment()), 1000)

    return () => clearInterval(int)
  }, [queue.id])

  const healthy = now.subtract(2, 'minutes').isBefore(pinged)

  return (
    <Chip severity={healthy ? 'success' : 'error'}>
      {healthy ? (!short ? 'Healthy' : 'H') : (!short ? 'Unhealthy' : 'U')}
    </Chip>
  )
}
