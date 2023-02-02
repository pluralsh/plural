import { LoopingLogo } from '@pluralsh/design-system'
import { Flex } from 'honorable'

function FullScreenSpinner() {
  return (
    <Flex
      align="center"
      justify="center"
      width="100vw"
      height="100vh"
      zIndex={100}
    >
      <LoopingLogo />
    </Flex>
  )
}

export default FullScreenSpinner
