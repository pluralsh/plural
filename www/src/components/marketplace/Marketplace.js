import { useRef } from 'react'
import { Div, Flex } from 'honorable'

import useBreadcrumbs from '../../hooks/useBreadcrumbs'

import { TOOLBAR_SIZE } from '../Toolbar'

import MarketplaceSidebar from './MarketplaceSidebar'
import MarketplaceRepositories from './MarketplaceRepositories'

function Marketplace({ installed }) {
  const scrollRef = useRef()

  useBreadcrumbs([
    { url: '/marketplace', text: 'Marketplace' },
  ])

  return (
    <Flex
      ref={scrollRef}
      align="flex-start"
      justify="flex-start"
      height="100%"
      maxHeight="100%"
      overflowY="auto"
      position="relative"
    >
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
      <Div
        flexGrow={1}
        overflowY="auto"
      >
        <MarketplaceRepositories
          installed={installed}
          scrollRef={scrollRef}
        />
      </Div>
    </Flex>
  )
}

export default Marketplace
