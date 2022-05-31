import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Div, Flex } from 'honorable'

import { FiltersIcon, Tab } from 'pluralsh-design-system'

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
        <Link
          to="/marketplace"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <Tab active={!installed}>
            Marketplace
          </Tab>
        </Link>
        <Link
          to="/installed"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <Tab active={installed}>
            Installed
          </Tab>
        </Link>
        <Flex
          pb={0.25}
          justify="flex-end"
          flexGrow={1}
          borderBottom="1px solid border"
        >
          <Button
            tertiary
            small
            startIcon={<FiltersIcon />}
            onClick={() => setAreFiltersOpen(x => !x)}
          >
            Filters
          </Button>
        </Flex>
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
        <Div
          ml={areFiltersOpen ? 2 : 0}
          flexShrink={0}
          position="sticky"
          top={0}
          left={0}
          width={areFiltersOpen ? 256 - 32 : 0}
          height={`calc(100% - ${32}px)`}
          overflowY="auto"
          border={areFiltersOpen ? '1px solid border' : 'none'}
          backgroundColor="fill-one"
          borderRadius="large"
          transition="width 250ms ease, border 250ms ease, margin-left 250ms ease"
        >
          <MarketplaceSidebar minWidth={256 - 32} />
        </Div>
      </Flex>
    </Flex>
  )
}

export default Marketplace
