import { useState } from 'react'
import { Button, Div, Flex } from 'honorable'

import { FiltersIcon } from 'pluralsh-design-system'

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
      <Flex flexShrink={0}>
        Top
        <Div flexGrow={1} />
        <Button
          tertiary
          small
          startIcon={<FiltersIcon />}
          onClick={() => setAreFiltersOpen(x => !x)}
        >
          Filters
        </Button>
      </Flex>
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
            ml={2}
            flexShrink={0}
            position="sticky"
            top={0}
            left={0}
            width={256 - 32}
            height={`calc(100% - ${32}px)`}
            overflowY="auto"
            border="1px solid border"
            backgroundColor="fill-one"
            borderRadius="large"
          >
            <MarketplaceSidebar />
          </Div>
        )}
      </Flex>
    </Flex>
  )
}

export default Marketplace
