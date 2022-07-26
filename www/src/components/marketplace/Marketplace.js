import { Flex } from 'honorable'

import { ResponsiveLayoutSpacer } from '../layout/ResponsiveLayout.tsx'

import MarketplaceRepositories from './MarketplaceRepositories'

function Marketplace({ installed }) {
  return (
    <Flex
      direction="column"
      overflow="hidden"
      flexGrow={1}
      maxWidth="100%"
    >
      <Flex flexGrow={1}>
        <ResponsiveLayoutSpacer />
        <MarketplaceRepositories
          installed={installed}
        />
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}

export default Marketplace
