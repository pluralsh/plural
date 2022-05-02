import { Div } from 'honorable'

import ExploreSidebar from './ExploreSidebar'
import ExploreRepositories from './ExploreRepositories'

function Explore() {
  return (
    <Div
      xflex="x1"
      height="100%"
    >
      <Div
        height="100%"
        width={256}
        flexShrink={0}
      >
        <ExploreSidebar />
      </Div>
      <Div flexGrow={1}>
        <ExploreRepositories />
      </Div>
    </Div>
  )
}

export default Explore
