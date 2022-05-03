import { Div } from 'honorable'

import { TOOLBAR_SIZE } from '../Toolbar'

import ExploreSidebar from './ExploreSidebar'
import ExploreRepositories from './ExploreRepositories'

function Explore() {
  return (
    <Div
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
        width={256}
        height={`calc(100vh - ${TOOLBAR_SIZE}px)`}
        overflowY="auto"
      >
        <ExploreSidebar />
      </Div>
      <Div
        flexGrow={1}
        overflowY="auto"
      >
        <ExploreRepositories />
      </Div>
    </Div>
  )
}

export default Explore
