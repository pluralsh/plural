import {
  A,
  Flex,
  Span,
  Text,
} from 'honorable'
import { ErrorIcon, Toast } from 'pluralsh-design-system'
import { useContext } from 'react'
import { useTheme } from 'styled-components'

import { getPreviousUserData } from '../../helpers/authentication'
import { CurrentUserContext, handlePreviousUserClick } from '../login/CurrentUser'

import Sidebar from './Sidebar'
import WithApplicationUpdate from './WithApplicationUpdate'

function ServiceAccountBanner({ previousUser }) {
  const me = useContext(CurrentUserContext)
  const theme = useTheme()

  return (
    <Flex
      direction="row"
      justifyContent="center"
      alignItems="center"
      gap={theme.spacing.xsmall}
      paddingTop="large"
      paddingRight="medium"
      paddingLeft="medium"
    >
      <ErrorIcon
        color="text-warning-light"
      />
      <Text>
        You are currently logged into the service account {me.email}.{' '}
        <A
          inline
          onClick={() => handlePreviousUserClick(previousUser)}
        >
          Switch to {previousUser.me.email}
        </A>
      </Text>
    </Flex>
  )
}

function ApplicationLayout({ children }) {
  const previousUser = getPreviousUserData()
  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <Flex
      position="relative"
      width="100vw"
      maxWidth="100vw"
      height="100vh"
      maxHeight="100vh"
      overflow="hidden"
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
      <Sidebar />
      <Flex
        direction="column"
        flexGrow={1}
        overflowX="hidden"
      >
        {previousUser && <ServiceAccountBanner previousUser={previousUser} />}
        {children}
      </Flex>
    </Flex>
  )
}

export default ApplicationLayout
