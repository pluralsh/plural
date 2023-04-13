import { Flex } from 'honorable'
import { Sidecar } from '@pluralsh/design-system'

export function AppSidecar(props: any) {
  return (
    <Flex
      flexDirection="column"
      gap="large"
      position="relative"
      {...props}
    >
      manage in console
      <Sidecar
        heading="metadata"
        display="flex"
        flexDirection="column"
        gap="xxsmall"
      >
        app status
        cluster
      </Sidecar>
    </Flex>
  )
}
