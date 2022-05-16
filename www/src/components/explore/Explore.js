import { useRef } from 'react'
import { Div, Flex } from 'honorable'

import useBreadcrumbs from '../../hooks/useBreadcrumbs'

import { TOOLBAR_SIZE } from '../Toolbar'

import ExploreSidebar from './ExploreSidebar'
import ExploreRepositories from './ExploreRepositories'

function Explore({ installed }) {
  const scrollRef = useRef()

  useBreadcrumbs([
    { url: '/explore', text: 'Explore' },
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
        <ExploreSidebar />
      </Div>
      <Div
        flexGrow={1}
        overflowY="auto"
      >
        <ExploreRepositories
          installed={installed}
          scrollRef={scrollRef}
        />
      </Div>
    </Flex>
  )
}

export default Explore
