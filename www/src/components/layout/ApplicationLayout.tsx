import { Toast } from '@pluralsh/design-system'
import { A, Flex, Span } from 'honorable'

import BillingMigrationModal from '../account/billing/BillingMigrationModal'

import Header from './Header'
import Sidebar from './Sidebar'
import Subheader from './Subheader'
import WithApplicationUpdate from './WithApplicationUpdate'
import { useTheme } from 'styled-components'

function ApplicationLayout({ children }: any) {
  const { colors } = useTheme()
  const isProduction = import.meta.env.MODE === 'production'

  return (
    <>
      <Flex
        position="relative"
        height="100%"
        minHeight="0"
        maxHeight="100vh"
        overflow="hidden"
        flexDirection="column"
        flexGrow={1}
        background={colors['fill-accent']}
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
                >
                  Update now
                </A>
              </Toast>
            )}
          </WithApplicationUpdate>
        )}
        <Header />
        <Flex
          width="100%"
          minWidth={0}
          minHeight={0}
          flexGrow={1}
          overflowX="auto"
        >
          <Sidebar />
          <Flex
            direction="column"
            flexGrow={1}
            position="relative"
          >
            <Subheader />
            {children}
          </Flex>
        </Flex>
      </Flex>
      <BillingMigrationModal />
    </>
  )
}

export default ApplicationLayout
