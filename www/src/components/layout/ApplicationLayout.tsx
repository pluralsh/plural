import { A, Flex, Span } from 'honorable'
import { Toast } from '@pluralsh/design-system'

import Sidebar from './Sidebar'
import WithApplicationUpdate from './WithApplicationUpdate'
import Header from './Header'
import Subheader from './Subheader'

function ApplicationLayout({ children }: any) {
  const isProduction = import.meta.env.MODE === 'production'

  return (
    <Flex
      position="relative"
      width="100vw"
      maxWidth="100vw"
      height="100vh"
      maxHeight="100vh"
      overflow="hidden"
      flexDirection="column"
    >
      {isProduction && (
        <WithApplicationUpdate>
          {({ reloadApplication }) => (
            <Toast
              severity="info"
              marginBottom="medium"
              marginRight="xxxxlarge"
            >
              <Span marginRight="small">Time for a new update!</Span>
              <A
                onClick={() => reloadApplication()}
                style={{ textDecoration: 'none' }}
                color="action-link-inline"
              >Update now
              </A>
            </Toast>
          )}
        </WithApplicationUpdate>
      )}
      <Header />
      <Flex
        width="100%"
        height="100%"
      >
        <Sidebar />
        <Flex
          direction="column"
          flexGrow={1}
          overflowX="hidden"
        >
          <Subheader />
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ApplicationLayout
