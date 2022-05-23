import { Div, Flex } from 'honorable'

import Toolbar from './Toolbar'
import Sidebar from './Sidebar'

function ApplicationLayout({ children }) {
  return (
    <Flex
      height="100vh"
      maxHeight="100vh"
    >
      <Sidebar />
      <Div
        height="100vh"
        maxHeight="100vh"
        flexGrow={1}
      >
        <Toolbar />
        {children}
      </Div>
    </Flex>
  )
}

export default ApplicationLayout
