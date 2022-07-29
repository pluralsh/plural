import { A, Flex } from 'honorable'
import moment from 'moment'
import {
  ArrowTopRightIcon, Button, Sidecar, SidecarItem,
} from 'pluralsh-design-system'
import { ReactElement, useContext } from 'react'

import QueueContext from '../../contexts/QueueContext'

import { Queue } from './Clusters'

export function ClustersSidecar(): ReactElement {
  const queue: Queue = useContext(QueueContext)

  return (
    <Flex
      gap={24}
      direction="column"
      paddingVertical="large"
    >
      <Button
        secondary
        endIcon={<ArrowTopRightIcon size={24} />}
        as={A}
        target="_blank"
        href={`https://${queue.domain}`}
        {...{
          '&:hover': {
            textDecoration: 'none',
          },
        }}
      >
        Console
      </Button>
      <Sidecar heading="Metadata">
        <SidecarItem heading="Cluster name">
          {queue.name}
        </SidecarItem>
        <SidecarItem heading="Git url">
          <A
            inline
            target="_blank"
            noreferrer
            noopener
            href={queue.git}
          >
            {queue.git}
          </A>
        </SidecarItem>
        <SidecarItem heading="Acked">
          {queue.acked}
        </SidecarItem>
        <SidecarItem heading="Last pinged">
          {moment(queue.pingedAt).format('lll')}
        </SidecarItem>
      </Sidecar>
    </Flex>
  )
}
