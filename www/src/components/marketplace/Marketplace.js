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
      pt={1}
      px={2}
      direction="column"
      overflow="hidden"
      flexGrow={1}
      maxWidth="100%"
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
        mt={1}
        flexGrow={1}
        overflow="hidden"
      >
        <MarketplaceRepositories
          installed={installed}
          flexGrow={1}
        />
        <Div
          ml={areFiltersOpen ? 2 : 0}
          mr={areFiltersOpen ? 0 : `-${256 - 32}px`}
          transform={areFiltersOpen ? 'translateX(0)' : 'translateX(100%)'}
          opacity={areFiltersOpen ? 1 : 0}
          flexShrink={0}
          position="sticky"
          top={0}
          right={0}
          width={256 - 32}
          height="calc(100% - 16px)"
          overflowY="auto"
          border="1px solid border"
          backgroundColor="fill-one"
          borderRadius="large"
          transition="all 250ms ease"
        >
          <MarketplaceSidebar minWidth={256 - 32} />
        </Div>
      </Flex>
    </Flex>
  )
}

export default Marketplace
