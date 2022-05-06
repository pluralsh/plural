import { useContext, useEffect, useRef } from 'react'
import { Div } from 'honorable'

import { TOOLBAR_SIZE } from '../Toolbar'

import { BreadcrumbsContext } from '../Breadcrumbs'

import ExploreSidebar from './ExploreSidebar'
import ExploreRepositories from './ExploreRepositories'

function Explore() {
  const scrollRef = useRef()

  const { setBreadcrumbs } = useContext(BreadcrumbsContext)

  useEffect(() => {
    const crumbs = [
      { url: '/explore', text: 'Explore' },
    ]
    setBreadcrumbs(crumbs)
  }, [setBreadcrumbs])

  return (
    <Div
      ref={scrollRef}
      xflex="x1"
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
        <ExploreRepositories scrollRef={scrollRef} />
      </Div>
    </Div>
  )
}

export default Explore
