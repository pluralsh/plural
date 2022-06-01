import { Flex } from 'honorable'

import Sidebar from './Sidebar'

function ApplicationLayout({ children }) {
  return (
    <Flex
      height="100vh"
      maxHeight="100vh"
      position="relative"
    >
      <Sidebar />
      <Flex
        direction="column"
        height="100vh"
        maxHeight="100vh"
        flexGrow={1}
      >
        {children}
      </Flex>
    </Flex>
  )
}

export default ApplicationLayout
