import { ThemeContext } from 'grommet'
import { Flex, H3 } from 'honorable'
import { PageCard } from 'pluralsh-design-system'
import { ReactElement, useContext } from 'react'

import QueueContext from '../../contexts/QueueContext'
import { providerToURL } from '../repos/misc'

import { Queue } from './Clusters'

export function ClustersSidenav(): ReactElement {
  const queue: Queue = useContext(QueueContext)

  return (
    <Flex
      gap={24}
      direction="column"
      paddingVertical="large"
    >
      <ProfileCard queue={queue} />
      <H3 paddingLeft={16}>Select Placeholder</H3>
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
