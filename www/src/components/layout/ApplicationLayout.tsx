import { Toast } from '@pluralsh/design-system'
import styled, { useTheme } from 'styled-components'

import BillingMigrationModal from '../account/billing/BillingMigrationModal'
import { InlineLinkButtonSC } from '../utils/Typography'

import Header from './Header'
import Sidebar from './Sidebar'
import WithApplicationUpdate from './WithApplicationUpdate'

function ApplicationLayout({ children }: any) {
  const { spacing } = useTheme()
  const isProduction = import.meta.env.MODE === 'production'

  return (
    <>
      <LayoutSC>
        {isProduction && (
          <WithApplicationUpdate>
            {({ reloadApplication }) => (
              <Toast
                severity="info"
                css={{
                  marginBottom: spacing.medium,
                  marginRight: spacing.xxxxlarge,
                }}
              >
                <span css={{ marginRight: spacing.xsmall }}>
                  Time for a new update!
                </span>
                <InlineLinkButtonSC onClick={() => reloadApplication()}>
                  Update now
                </InlineLinkButtonSC>
              </Toast>
            )}
          </WithApplicationUpdate>
        )}
        <BodySC>
          <Sidebar />
          <MainSC>
            <Header />
            <ContentSC>{children}</ContentSC>
          </MainSC>
        </BodySC>
      </LayoutSC>
      <BillingMigrationModal />
    </>
  )
}

export default ApplicationLayout

const LayoutSC = styled.div(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  maxHeight: '100vh',
  overflow: 'hidden',
  flexGrow: 1,
  background: theme.colors['fill-accent'],
}))

const BodySC = styled.div({
  display: 'flex',
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  flexGrow: 1,
  overflowX: 'auto',
})

const MainSC = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
})

const ContentSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  minHeight: 0,
  overflow: 'auto',
  backgroundColor: theme.colors['fill-zero'],
}))
