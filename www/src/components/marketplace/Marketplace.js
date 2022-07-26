import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Div, Flex } from 'honorable'

import { FiltersIcon, Tab } from 'pluralsh-design-system'

import { ResponsiveLayoutSpacer } from '../layout/ResponsiveLayout.tsx'

import MarketplaceSidebar from './MarketplaceSidebar'
import MarketplaceRepositories from './MarketplaceRepositories'

const sidebarWidth = 256 - 32

function Marketplace({ installed }) {
  const [areFiltersOpen, setAreFiltersOpen] = useState(true)

  return (
    <Flex
      direction="column"
      overflow="hidden"
      flexGrow={1}
      maxWidth="100%"
    >
      <Flex flexGrow={1}>
        <ResponsiveLayoutSpacer />
        <Flex
          direction="column"
          maxWidth-desktopLarge-up={1640}
        >
          <Flex
            marginHorizontal="large"
            flexShrink={0}
            direction="row"
            height={57}
            alignItems="flex-end"
          >
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
              alignSelf="stretch"
              paddingBottom="xxsmall"
              paddingTop="xxsmall"
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
            marginTop="medium"
            flexGrow={1}
            overflow="hidden"
          >
            <MarketplaceRepositories
              installed={installed}
              flexGrow={1}
            />
            <Div
              marginRight={areFiltersOpen ? 'large' : `-${sidebarWidth}px`}
              transform={areFiltersOpen ? 'translateX(0)' : 'translateX(100%)'}
              opacity={areFiltersOpen ? 1 : 0}
              flexShrink={0}
              position="sticky"
              top={0}
              right={0}
              width={sidebarWidth}
              height="calc(100% - 16px)"
              overflowY="auto"
              border="1px solid border"
              backgroundColor="fill-one"
              borderRadius="large"
              transition="all 250ms ease"
              zIndex={9999}
            >
              <MarketplaceSidebar width="100%" />
            </Div>
          </Flex>
        </Flex>
        <ResponsiveLayoutSpacer />
      </Flex>
    </Flex>
  )
}

export default Marketplace
