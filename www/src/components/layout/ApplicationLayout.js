import { Flex } from 'honorable'

import Sidebar from './Sidebar'

function ApplicationLayout({ children }) {
  return (
    <Flex
      position="relative"
      width="100vw"
      maxWidth="100vw"
      height="100vh"
      maxHeight="100vh"
      overflow="hidden"
    >
      <Sidebar />
      <Flex
        direction="column"
        flexGrow={1}
      >
        {children}
      </Flex>
    </Flex>
  )
}

export default ApplicationLayout
