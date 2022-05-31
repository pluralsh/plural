import { useRef, useState } from 'react'
import { Div, Flex } from 'honorable'

import { TOOLBAR_SIZE } from '../Toolbar'

import MarketplaceSidebar from './MarketplaceSidebar'
import MarketplaceRepositories from './MarketplaceRepositories'

function Marketplace({ installed }) {
  const [areFiltersOpen, setAreFiltersOpen] = useState(false)

  return (
    <Flex
      p={2}
      direction="column"
      overflow="hidden"
      flexGrow={1}
      maxHeight="100%"
    >
      <Div flexShrink={0}>
        Top
      </Div>
      <Flex
        id="1"
        mt={1}
        flexGrow={1}
        maxHeight="100%"
      >
        <Flex
          direction="column"
          flexGrow={1}
        >
          <MarketplaceRepositories
            installed={installed}
          />
        </Flex>
        {areFiltersOpen && (
          <Div
            flexShrink={0}
            position="sticky"
            top={0}
            left={0}
            width={256 - 32}
            height={`calc(100vh - ${TOOLBAR_SIZE}px)`}
            overflowY="auto"
            borderRight="1px solid border"
          >
            <MarketplaceSidebar />
          </Div>
        )}
      </Flex>
    </Flex>
  )
}

export default Marketplace
