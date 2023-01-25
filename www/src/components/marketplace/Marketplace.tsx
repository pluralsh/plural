import { Flex } from 'honorable'

import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'

import MarketplaceRepositories from './MarketplaceRepositories'

function Marketplace({ installed = false, publisher = null }: any) {
  return (
    <Flex
      direction="column"
      overflow="hidden"
      flexGrow={1}
      maxWidth="100%"
    >
      <Flex
        flexGrow={1}
        overflow="hidden"
      >
        {!publisher && <ResponsiveLayoutSpacer />}
        <MarketplaceRepositories
          installed={installed}
          publisher={publisher}
        />
        {!publisher && <ResponsiveLayoutSpacer />}
      </Flex>
    </Flex>
  )
}

export default Marketplace
