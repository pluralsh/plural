import { Flex } from 'honorable'
import { ReactElement } from 'react'

export function ClustersApps(): ReactElement {
  return (
    <Flex
      direction="column"
      padding="large"
      gap="large"
      flexGrow={1}
      overflow="auto"
    >
      apps
    </Flex>
  )
}
