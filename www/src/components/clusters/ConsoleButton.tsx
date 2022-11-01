import { useQuery } from '@apollo/client'
import { Button } from 'honorable'
import { ArrowTopRightIcon } from 'pluralsh-design-system'

import { QUEUES } from './queries'

export function ConsoleButton({ q = {}, text, ...props }: any) {
  return (
    <Button
      secondary
      as="a"
      target="_blank"
      href={`https://${q.domain}`}
      textDecoration="none"
      endIcon={<ArrowTopRightIcon />}
      {...props}
    >
      {text || 'View in Console'}
    </Button>
  )
}

export function InferredConsoleButton(props) {
  const { data } = useQuery(QUEUES, { fetchPolicy: 'cache-and-network' })

  if (!data?.upgradeQueues) return null

  if (data.upgradeQueues.length === 0) return null

  return (
    <ConsoleButton
      q={data.upgradeQueues[0]}
      {...props}
    />
  )
}
