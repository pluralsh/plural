import { Box } from 'grommet'
import { A, Flex, Span } from 'honorable'
import { ErrorIcon } from 'pluralsh-design-system'
import { useContext } from 'react'

import { getPreviousUserData } from '../../helpers/authentication'
import { CurrentUserContext, handlePreviousUserClick } from '../login/CurrentUser'

import Sidebar from './Sidebar'

function ServiceAccountBanner({ previousUser }) {
  const me = useContext(CurrentUserContext)

  return (
    <Box
      flex={false}
      height="30px"
      direction="row"
      justify="center"
      align="center"
      gap="3px"
    >
      <ErrorIcon
        color="icon-warning"
        marginRight="2px"
      />
      <Span>You are currently logged into the service account {me.email}.</Span>
      <A
        color="action-link-inline"
        onClick={() => handlePreviousUserClick(previousUser)}
      >Switch to {previousUser.me.email}
      </A>
    </Box>
  )
}

function ApplicationLayout({ children }) {
  const previousUser = getPreviousUserData()

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
        overflowX="hidden"
      >
        {previousUser && <ServiceAccountBanner previousUser={previousUser} />}
        {children}
      </Flex>
    </Flex>
  )
}

export default ApplicationLayout
